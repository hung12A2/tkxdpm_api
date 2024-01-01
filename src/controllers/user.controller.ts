import {
  TokenService,
  UserService,
  authenticate,
} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  Request,
  Response,
  RestBindings,
  get,
  getModelSchemaRef,
  post,
  requestBody,
} from '@loopback/rest';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {UserServiceBindings} from '../keys';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import {UserManagementService} from '../services';
import {
  checkValidEmail,
  checkValidGender,
  checkValidPassword,
  checkValidPhoneNumber,
} from '../services/checkValid';

export class UserManagementController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(RestBindings.Http.REQUEST) private request: Request,
  ) {}

  @post('/users/customer', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async createCustomer(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id', 'role'],
          }),
        },
      },
    })
    newUserRequest: User,
  ): Promise<any> {
    // All new users have the "customer" role by default
    newUserRequest.role = 'customer';

    try {
      if (
        (
          await this.userRepository.find({
            where: {username: newUserRequest.username},
          })
        ).length > 0
      ) {
        return this.response
          .send({message: 'Đã tồn tại username này rồi '})
          .status(422);
      }
      if (!checkValidPhoneNumber(newUserRequest.phonenumber))
        return this.response
          .send({message: 'Số điện thoại không phù hợp'})
          .status(422);

      if (!checkValidEmail(newUserRequest.email))
        return this.response.send({message: 'Email không hợp lệ'}).status(422);

      if (!checkValidPassword(newUserRequest.password))
        return this.response
          .send({message: 'Mật khẩu không đủ 6 kí tự'})
          .status(422);

      if (!checkValidGender(newUserRequest.gender))
        return this.response
          .send({message: 'Giới tính là Nam Nữ hoặc Khác'})
          .status(422);

      const data = await this.userRepository.create(newUserRequest);
      await this.userRepository.cart(data.id).create({});
      return data;
    } catch (error) {
      throw error;
    }
  }

  @post('/users/admin', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async createAdmin(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    newUserRequest: User,
  ): Promise<any> {
    // All new users have the "customer" role by default
    newUserRequest.role = 'admin';

    try {
      const list = await this.userRepository.find({
        where: {username: newUserRequest.username},
      });
      if (list.length > 0) {
        return this.response
          .status(422)
          .send({message: 'Đã tồn tại username này rồi'});
      }
      const data = await this.userRepository.create(newUserRequest);
      return data;
    } catch (error) {
      throw error;
    }
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      description: 'The input of login function',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: {
                type: 'string',
              },
              password: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }

  @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'USER',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<User> {
    return this.userRepository.findById(currentUserProfile[securityId]);
  }
}

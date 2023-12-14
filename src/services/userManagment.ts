// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';

export class UserManagementService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

  ) { }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const {username, password} = credentials;
    const invalidCredentialsError = 'Invalid email or password.';

    if (!username) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    const foundUser = await this.userRepository.findOne({
      where: {username},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    // since first name and lastName are optional, no error is thrown if not provided
    if (user.id) {
      return {
        [securityId]: user.id,
        fullname: user.fullname,
        email: user.email,
        gender: user.gender,
        phonenumber: user.phonenumber,
        username: user.username,
        id: user.id,
        role: user.role,
      }
    }
    else return {
      [securityId]: '',
      fullname: user.fullname,
      email: user.email,
      gender: user.gender,
      phonenumber: user.phonenumber,
      username: user.username,
      id: user.id,
      role: user.role,
    }
  }
}

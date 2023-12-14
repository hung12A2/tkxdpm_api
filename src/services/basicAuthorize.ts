// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';
import {UserProfile} from '@loopback/security';

// Instance level authorizer
// Can be also registered as an authorizer, depends on users' need.
export async function basicAuthorization(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  // No access if authorization details are missing
  let currentUser: UserProfile;
  if (authorizationCtx.principals.length > 0) {
    currentUser = authorizationCtx.principals[0];
  } else {
    return AuthorizationDecision.DENY;
  }


  if (!currentUser.role) {
    return AuthorizationDecision.DENY;
  }

  // Authorize everything that does not have a allowedRoles property
  if (!metadata.allowedRoles) {
    return AuthorizationDecision.ALLOW;
  }

  let roleIsAllowed = false;
  if (metadata.allowedRoles!.includes(currentUser.role)) {
    roleIsAllowed = true;
    ;
  }

  if (!roleIsAllowed) {
    return AuthorizationDecision.DENY;
  }

  return AuthorizationDecision.ALLOW

}

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _seedData from "../_seedData.js";
import type * as admin from "../admin.js";
import type * as assistantThreads from "../assistantThreads.js";
import type * as bootstrap from "../bootstrap.js";
import type * as lessons from "../lessons.js";
import type * as lib_auth from "../lib/auth.js";
import type * as modules from "../modules.js";
import type * as progress from "../progress.js";
import type * as quizzes from "../quizzes.js";
import type * as retrieval from "../retrieval.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _seedData: typeof _seedData;
  admin: typeof admin;
  assistantThreads: typeof assistantThreads;
  bootstrap: typeof bootstrap;
  lessons: typeof lessons;
  "lib/auth": typeof lib_auth;
  modules: typeof modules;
  progress: typeof progress;
  quizzes: typeof quizzes;
  retrieval: typeof retrieval;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

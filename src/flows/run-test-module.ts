/* eslint-disable no-await-in-loop */
import { createRunner } from "../conformance-api/runner/create-runner";
import { getRunnerStatus } from "../conformance-api/runner/get-runner-status";
import { getModuleInfo } from "../conformance-api/test-module/get-module-info";
import { PlanTestModule, TestModuleStatus, Authorizer } from "../types";
import { sleep } from "../utils/sleep";
import { visitUrl } from "../conformance-api/runner/visit-url";
import { sendCallback } from "../conformance-api/test-module/send-callback";
import { logger } from "../logger";

export const runTestModule = async (
  planId: string,
  module: PlanTestModule,
  authorizer: Authorizer,
) => {
  const { id } = await createRunner(planId, module);

  let moduleInfo = await getModuleInfo(id);

  const finalStatuses: TestModuleStatus[] = [
    "FINISHED",
    "INTERRUPTED",
    "REVIEW",
  ];

  logger.info("Starting test polling");

  while (!finalStatuses.includes(moduleInfo.status)) {
    moduleInfo = await getModuleInfo(id);

    logger.info("Test status", { status: moduleInfo.status });

    const {
      browser: { urls },
    } = await getRunnerStatus(id);

    if (urls.length) {
      logger.info("Visiting authorization URL");

      let interactionCookies = await authorizer.startInteraction(urls[0]);

      await visitUrl(id, urls[0]);

      logger.info("Interaction started");

      interactionCookies = await authorizer.login(interactionCookies);

      logger.info("Signed in successfully");

      const callbackUrl = await authorizer.confirm(interactionCookies);

      logger.info("Consent confirmed");

      await sendCallback(callbackUrl);
    }

    if (!finalStatuses.includes(moduleInfo.status)) {
      await sleep(3000);
    }
  }

  logger.info("Test finished", {
    id,
    name: module.testModule,
    status: moduleInfo.status,
    result: moduleInfo.result,
  });
};

/* eslint-disable no-await-in-loop */
import { createPlan } from "../conformance-api/plan/create-plan";
import { logger } from "../logger";
import { AnyObject, ConformanceOptions, PlanOptions } from "../types";
import { sleep } from "../utils/sleep";
import { runTestModule } from "./run-test-module";

export const createAndRunPlan = async <T extends AnyObject>(
  conformanceOptions: ConformanceOptions,
  planOptions: PlanOptions<T>,
) => {
  const { id, modules } = await createPlan(planOptions);

  logger.info(
    `Plan created, visit ${conformanceOptions.conformanceUrl}/plan-detail.html?plan=${id}. Test starting in 5 seconds...`,
  );

  await sleep(5000);

  for (const module of modules) {
    await runTestModule(id, module, conformanceOptions.authorizer);
  }

  logger.info("Plan completed!");
};

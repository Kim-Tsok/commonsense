import {
  getDefaultAutoSelectFamilyAttemptTimeout,
  setDefaultAutoSelectFamily,
  setDefaultAutoSelectFamilyAttemptTimeout,
} from "node:net";
import { setDefaultResultOrder } from "node:dns";

/** Give dual-stack connection attempts enough time on higher-latency networks. */
export function configureNeonNetwork() {
  // Opt in only on networks whose DNS64/dual-stack routes fail in Node.
  if (process.env.DATABASE_IPV4_ONLY === "true") {
    setDefaultResultOrder("ipv4first");
    setDefaultAutoSelectFamily(false);
  }
  if (getDefaultAutoSelectFamilyAttemptTimeout() < 3000) {
    setDefaultAutoSelectFamilyAttemptTimeout(3000);
  }
}

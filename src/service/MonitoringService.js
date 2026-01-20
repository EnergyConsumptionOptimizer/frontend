import { SocketController } from "@/sockets/SocketController.js";

const SOCKET_PREFIX = "/monitoring";
const REAL_TIME_NAMESPACE = "/real-time";
const UTILITY_CONSUMPTION_NAMESPACE = "/utility-consumptions";

export class MonitoringService {
  realTimeSocket = null;
  utilityConsumptionSocket = null;

  realTimeSubscribersCount = 0;

  subscribedToRealTimeMetersUpdates = false;
  subscribedToActiveSmartFurnitureHookupsUpdates = false;

  async #subscribeToRealTimeUpdates() {
    if (!this.realTimeSocket) {
      this.realTimeSocket = new SocketController();
    }

    await this.realTimeSocket.connect(REAL_TIME_NAMESPACE, SOCKET_PREFIX);
  }

  async subscribeToRealTimeMetersUpdates(onUpdate) {
    this.realTimeSubscribersCount++;
    if (this.subscribedToRealTimeMetersUpdates) {
      console.warn(
        `Socket already subscribed to ${REAL_TIME_NAMESPACE} meters room`,
      );
      return;
    }

    await this.#subscribeToRealTimeUpdates();
    console.log(`subscribedToRealTimeMetersUpdates`);

    this.realTimeSocket?.on("utilityMetersUpdate", (data) => {
      console.log("Meters update received:", data);
      onUpdate(data.utilityMeters);
    });

    this.realTimeSocket?.emit("subscribeRealTimeUtilityMeters");

    this.subscribedToRealTimeMetersUpdates = true;
  }

  async subscribeToActiveSmartFurnitureHookups(onUpdate) {
    this.realTimeSubscribersCount++;
    if (this.subscribedToActiveSmartFurnitureHookupsUpdates) {
      console.warn(
        `Socket already subscribed to ${REAL_TIME_NAMESPACE} active smart furniture hookup room`,
      );
      return;
    }

    await this.#subscribeToRealTimeUpdates();
    console.log(`subscribeToActiveSmartFurnitureHookups`);

    this.realTimeSocket?.on("activeSmartFurnitureHookupsUpdate", (data) => {
      console.log("Active smart furniture hookups update received:", data);

      onUpdate(data.activeSmartFurnitureHookups);
    });

    this.realTimeSocket?.emit("subscribeActiveSmartFurnitureHookups");

    this.subscribedToActiveSmartFurnitureHookupsUpdates = true;
  }

  async subscribeToUtilityConsumptions(query, onUpdate) {
    if (!this.utilityConsumptionSocket) {
      this.utilityConsumptionSocket = new SocketController();
    }
    await this.utilityConsumptionSocket.connect(
      UTILITY_CONSUMPTION_NAMESPACE,
      SOCKET_PREFIX,
    );

    this.utilityConsumptionSocket?.emit("subscribe", query);
    this.utilityConsumptionSocket?.on("utilityConsumptionsUpdate", (data) => {
      onUpdate(data);
    });
    this.utilityConsumptionSocket?.on(
      "utilityConsumptionsQueryUpdate",
      (data) => {
        onUpdate(data);
      },
    );
  }

  async editUtilityConsumptionQuery(query) {
    if (!this.utilityConsumptionSocket) {
      console.warn("Register a query first");
      return;
    }

    return new Promise((resolve, reject) => {
      let timeoutId;

      const cleanup = () => {
        clearTimeout(timeoutId);
        this.utilityConsumptionSocket?.off(
          "utilityConsumptionsQueryUpdate",
          () => {},
        );
      };

      timeoutId = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            `Timeout: No update received for query label '${query.label}' within 10s`,
          ),
        );
      }, 10000);

      this.utilityConsumptionSocket?.on(
        "utilityConsumptionsQueryUpdate",
        (data) => {
          if (data && data.label === query.label) {
            cleanup();
            resolve(data);
          }
        },
      );

      this.utilityConsumptionSocket?.emit("editQuery", query);
    });
  }

  disconnect() {
    if (this.realTimeSocket) {
      this.realTimeSubscribersCount--;
      if (this.realTimeSubscribersCount < 0) this.realTimeSubscribersCount = 0;
      if (this.realTimeSubscribersCount !== 0) {
        return;
      }
      this.realTimeSocket.disconnect();
      this.subscribedToRealTimeMetersUpdates = false;
      this.subscribedToActiveSmartFurnitureHookupsUpdates = false;
    }

    if (this.utilityConsumptionSocket) {
      this.utilityConsumptionSocket.disconnect();
    }

    console.log("MonitoringService: All sockets disconnected and flags reset.");
  }
}

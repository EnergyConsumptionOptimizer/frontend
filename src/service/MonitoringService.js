import { socketController } from "@/sockets/SocketController.js";

const BASE_URL = "http://10.250.23.192:3004";
const REAL_TIME_NAMESPACE = "real-time";

export class MonitoringService {
  realTimeSocket = null;

  subscribedToRealTimeMetersUpdates = false;
  subscribedToActiveSmartFurnitureHookupsUpdates = false;

  async _subscribeToRealTimeUpdates() {
    if (!this.realTimeSocket) {
      this.realTimeSocket = new socketController();
    }

    await this.realTimeSocket.connect(`${BASE_URL}/${REAL_TIME_NAMESPACE}`);
  }

  async subscribeToRealTimeMetersUpdates(onUpdate) {
    if (this.subscribedToRealTimeMetersUpdates) {
      console.warn(
        `Socket already subscribed to ${REAL_TIME_NAMESPACE} meters room`,
      );
      return;
    }

    await this._subscribeToRealTimeUpdates();
    console.log(`subscribedToRealTimeMetersUpdates`);

    this.realTimeSocket?.on("utilityMetersUpdate", (data) => {
      console.log("Meters update received:", data);
      onUpdate(data.utilityMeters);
    });

    this.realTimeSocket?.emit("subscribeRealTimeUtilityMeters");

    this.subscribedToRealTimeMetersUpdates = true;
  }

  async subscribeToActiveSmartFurnitureHookups(onUpdate) {
    if (this.subscribedToActiveSmartFurnitureHookupsUpdates) {
      console.warn(
        `Socket already subscribed to ${REAL_TIME_NAMESPACE} active smart furniture hookup room`,
      );
      return;
    }

    await this._subscribeToRealTimeUpdates();
    console.log(`subscribeToActiveSmartFurnitureHookups`);

    this.realTimeSocket?.on("activeSmartFurnitureHookupsUpdate", (data) => {
      console.log("Active smart furniture hookups update received:", data);

      onUpdate(data.activeSmartFurnitureHookups);
    });

    this.realTimeSocket?.emit("subscribeActiveSmartFurnitureHookups");

    this.subscribedToActiveSmartFurnitureHookupsUpdates = true;
  }
}

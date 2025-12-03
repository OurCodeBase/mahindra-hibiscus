import type { Token } from "@/hooks/token";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min = 1000, max = 1800) {
  return Math.random() * (max - min) + min;
}

export class SearchConsole {
  private token: Token
  private vinnos: Array<string>;
  constructor(token: Token, search: string) {
    this.token = token;
    this.vinnos = search.split(' ');
  }
  private async getVehicleInfo(vinno: string, subdomain: string) {
    const request = await fetch(`https://${subdomain}.mahindramobilitysolution.com/iTraMS-webservices/kyc/getAllKyc`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "authorization": this.token.authorization,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        direction: "ascending",
        sortingAttribute: "vinNumber",
        pageSize: 1,
        recordsCountToFetch: 1,
        pageNumber: 0,
        textToFilter: vinno
      }),
      credentials: "include"
    });
    const error = new Error("Your session has been expired.");
    error.name = "AUTHORIZATION-REVOKED";
    if (request.status == 401) throw error;
    const response = await request.json();
    const dataModel = response["dataModel"]["data"]
    if (dataModel.length > 0) {
      const model = dataModel[dataModel.length - 1];
      const row = [
        { value: vinno },
        { value: model.kycRegistrationStatus ? "Yes" : "No" },
        { value: model.signupStatus ? "Yes" : "No" },
        { value: model.name },
      ]
      return row;
    } else {
      const row = [
        { value: vinno },
        { value: "No" },
        { value: "No" },
      ]
      return row;
    }
  }
  public async getAllKyc() {
    const columns = [];
    for (let index = 0; index < this.vinnos.length; index++) {
      await sleep(randomDelay())
      const vin = this.vinnos[index];
      const subdomain = vin.startsWith('MA1R') ? 'service-cv' : 'service';
      const rows = await this.getVehicleInfo(vin, subdomain);
      columns.push(rows);
    }
    return columns;
  }
}

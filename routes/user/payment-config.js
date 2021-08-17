const nets_api_key  = "ed4dc5a8-1291-4078-a77f-6705734bf3c0";
const nets_api_skey = "f37eeb77-ba0b-40c6-bead-468e6a5de009";
const nets_api_gateway = {
	request: "https://uat-api.nets.com.sg:9065/uat/merchantservices/qr/dynamic/v1/order/request",
	query: "https://uat-api.nets.com.sg:9065/uat/merchantservices/qr/dynamic/v1/transaction/query",
	void: "https://uat-api.nets.com.sg:9065/uat/merchantservices/qr/dynamic/v1/transaction/reversal"
};

module.exports = {nets_api_key, nets_api_skey, nets_api_gateway};
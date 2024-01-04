export const CONFIG_VNPAY = {
  "vnp_TmnCode": "L70J00E6",
  "vnp_HashSecret": "HPHVFPPQBJKKPYSOMTWHAJEKPZMKKCAQ",
  "vnp_Url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  "vnp_Api": "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  "vnp_ReturnUrl": "http://localhost:3000/ReturnPage",
  "vnp_Version": "2.1.0",
  "vnp_Command": "pay",
  "vnp_Locale": "vn",
  "vnp_CurrCode": "VND",
  "ip_Addr": "127.0.0.1"
}


//  // test pay
//  @post('order/pay', {
//   responses: {
//     '200': {
//       description: 'Return pay informaion'
//     },
//   },
// })
// testPay(
//   @requestBody({
//     description: "testVnpay",
//     required: true,
//     content: {
//       'application/json': {
//         schema: {
//           type: 'object',
//           required: ['amount_money'],
//           properties: {
//             amount_money: {
//               type: 'number'
//             }
//           }
//         }
//       }
//     }
//   }) data: any
// ): String {
//   const now = new Date();
//   const createDate = moment(now).format('YYYYMMDDHHmmss');
//   const ip_Addr = this.request.ip;
//   const tmnCode = CONFIG_VNPAY.vnp_TmnCode;
//   const secretKey = CONFIG_VNPAY.vnp_HashSecret
//   let vnpUrl = CONFIG_VNPAY.vnp_Url
//   const returnUrl = CONFIG_VNPAY.vnp_ReturnUrl
//   const orderId = moment(now).format('DDHHmmss');
//   const amount = parseInt(data.amount_money, 10) || 0;
//   const locale = CONFIG_VNPAY.vnp_Locale;
//   const currCode = CONFIG_VNPAY.vnp_CurrCode;
//   let vnp_Params: Record<string, any> = {};
//   vnp_Params['vnp_Version'] = '2.1.0';
//   vnp_Params['vnp_Command'] = 'pay';
//   vnp_Params['vnp_TmnCode'] = tmnCode;
//   vnp_Params['vnp_Locale'] = locale;
//   vnp_Params['vnp_CurrCode'] = currCode;
//   vnp_Params['vnp_TxnRef'] = orderId;
//   vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
//   vnp_Params['vnp_OrderType'] = 'other';
//   vnp_Params['vnp_Amount'] = amount * 100;
//   vnp_Params['vnp_ReturnUrl'] = returnUrl;
//   vnp_Params['vnp_IpAddr'] = ip_Addr;
//   vnp_Params['vnp_CreateDate'] = createDate;
//   vnp_Params = sortObject(vnp_Params);
//   const signData = qs.stringify(vnp_Params, {encode: false});
//   let hmac = crypto.createHmac("sha512", secretKey);
//   let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
//   vnp_Params['vnp_SecureHash'] = signed;
//   vnpUrl += '?' + qs.stringify(vnp_Params, {encode: false});

//   return (vnpUrl)
// }

// // test Handle
// @get('order/vnpay_return/', {
//   responses: {
//     '200': {
//       description: 'Handle transaction info'
//     },
//   },
// })
// testHandlePay(

// ): any {
//   this.response.send({...this.request.query});
// }


// //test refund
// @post('order/vnpay_refund', {
//   responses: {
//     '200': {
//       description: 'Handle transaction info'
//     },
//   },
// })
// async testHandleRefund(
//   @requestBody({
//     description: "toi muon di ngu",
//     content: {
//       'application/json': {
//         schema: {
//           type: 'object',
//           required: ['vnp_TxnRef', 'vnp_TransactionDate', 'vnp_Amount', 'vnp_TransactionType', 'vnp_CreateBy'],
//           properties: {
//             vnp_TxnRef: {
//               type: 'string'
//             },
//             vnp_TransactionDate: {
//               type: 'string'
//             },
//             vnp_Amount: {
//               type: 'string'
//             },
//             vnp_TransactionType: {
//               type: 'string'
//             },
//             vnp_CreateBy: {
//               type: 'string'
//             }
//           }
//         }
//       }
//     }
//   }) data: any
// ) {
//   const date = new Date();
//   const vnp_TmnCode = CONFIG_VNPAY.vnp_TmnCode
//   const secretKey = CONFIG_VNPAY.vnp_HashSecret;
//   const vnp_Api = CONFIG_VNPAY.vnp_Api;
//   const vnp_TxnRef = data.vnp_TxnRef;

//   const vnp_TransactionDate = data.vnp_TransactionDate;
//   const vnp_Amount = data.vnp_Amount * 100;
//   const vnp_TransactionType = data.vnp_TransactionType;
//   const vnp_CreateBy = data.vnp_CreateBy;
//   const vnp_TransactionNo = '0';
//   const vnp_CurrCode = CONFIG_VNPAY.vnp_CurrCode;
//   const vnp_RequestId = moment(date).format('HHmmss');
//   const vnp_Version = '2.1.0';
//   const vnp_Command = 'refund';
//   const vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;
//   const vnp_IpAddr = this.request.ip;
//   const vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
//   const dataVnpay = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
//   const hmac = crypto.createHmac("sha512", secretKey);
//   const vnp_SecureHash = hmac.update(Buffer.from(dataVnpay, 'utf-8')).digest("hex");
//   const dataObj = {
//     'vnp_RequestId': vnp_RequestId,
//     'vnp_Version': vnp_Version,
//     'vnp_Command': vnp_Command,
//     'vnp_TmnCode': vnp_TmnCode,
//     'vnp_TransactionType': vnp_TransactionType,
//     'vnp_TransactionNo': vnp_TransactionNo,
//     'vnp_TxnRef': vnp_TxnRef,
//     'vnp_Amount': vnp_Amount,
//     'vnp_CreateBy': vnp_CreateBy,
//     'vnp_OrderInfo': vnp_OrderInfo,
//     'vnp_TransactionDate': vnp_TransactionDate,
//     'vnp_CreateDate': vnp_CreateDate,
//     'vnp_IpAddr': vnp_IpAddr,
//     'vnp_SecureHash': vnp_SecureHash
//   };

//   return dataObj;

//   // const resp = await (await fetch(`${vnp_Api}`, {
//   //   method: 'POST',
//   //   body: JSON.stringify(dataObj),
//   //   headers: {'Content-Type': 'application/json'}
//   // })).json

//   // return (resp);

// }
// }

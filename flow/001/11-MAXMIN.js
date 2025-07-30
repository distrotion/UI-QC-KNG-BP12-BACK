const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mongodbINS = require('../../function/mongodbINS');
var mssql = require('../../function/mssql');
var request = require('request');
const axios = require("../../function/axios");

//----------------- date

const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
let day = d;

//----------------- SETUP

let NAME_INS = 'MAXMIN'

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let GRAPH_TABLE = 'GRAPH_TABLE';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';
let UNIT = 'UNIT';

let CAL1 = 'CALCULATE';

//----------------- dynamic

let finddbbuffer = [{}];

let MAXMINdb = {
  "INS": NAME_INS,
  "PO": "",
  "CP": "",
  "MATCP": '',
  "QTY": "",
  "PROCESS": "",
  "CUSLOT": "",
  "TPKLOT": "",
  "FG": "",
  "CUSTOMER": "",
  "PART": "",
  "PARTNAME": "",
  "MATERIAL": "",
  //---new
  "QUANTITY": '',
  // "PROCESS": '',
  "CUSLOTNO": '',
  "FG_CHARG": '',
  "PARTNAME_PO": '',
  "PART_PO": '',
  "CUSTNAME": '',
  //-------
  "ItemPick": [],
  "ItemPickcode": [],
  "POINTs": "",
  "PCS": "",
  "PCSleft": "",
  "UNIT": "",
  "INTERSEC": "",
  "RESULTFORMAT": "",
  "GRAPHTYPE": "",
  "GAP": "",
  "GAPname": '',
  "GAPnameList": [],
  "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  //---------
  "preview": [],
  "confirmdata": [],
  "ITEMleftUNIT": [],
  "ITEMleftVALUE": [],
  //
  "MeasurmentFOR": "FINAL",
  "inspectionItem": "", //ITEMpice
  "inspectionItemNAME": "",
  "tool": NAME_INS,
  "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
  "dateupdatevalue": day,
  "INTERSEC_ERR": 0,
  //
  "K1b": '',
  "K1v": '',
  "FORMULA": '',
  "ANSCAL2": '',
  "confirmdataCW": [{
    "VAL1": "",
    "VAL2": "",
    "VAL3": "",
    "VAL4": "",
    "Aear": "",
    "FORMULA": "",
    "var": "",

    'Result1': "",
    'Result2': "",
    'Result': "",

  }],
  //
  "PIC": "",
  //----------------------
  "USER": "",
  "USERID": "",
}



router.get('/CHECK-MAXMIN', async (req, res) => {

  return res.json(MAXMINdb['PO']);
});


router.post('/MAXMINdb', async (req, res) => {
  //-------------------------------------
  // console.log('--MAXMINdb--');
  // console.log(req.body);
  //-------------------------------------
  let finddb = [{}];
  try {

    finddb = MAXMINdb;
    finddbbuffer = finddb;
  }
  catch (err) {
    finddb = finddbbuffer;
  }
  //-------------------------------------
  return res.json(finddb);
});

router.post('/GETINtoMAXMIN', async (req, res) => {
  //-------------------------------------
  console.log('--GETINtoMAXMIN--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  check = MAXMINdb;
  if (input['PO'] !== undefined && input['CP'] !== undefined && check['PO'] === '') {
    // let dbsap = await mssql.qurey(`select * FROM [SAPData_HES_ISN].[dbo].[tblSAPDetail] where [PO] = ${input['PO']}`);

    let findPO = await mongodb.findSAP('mongodb://172.23.10.39:12012', "ORDER", "ORDER", {});
    

    let cuslot = '';

    if (findPO[0][`DATA`] != undefined && findPO[0][`DATA`].length > 0) {
      let dbsap = ''
      for (i = 0; i < findPO[0][`DATA`].length; i++) {
        if (findPO[0][`DATA`][i][`PO`] === input['PO']) {
          dbsap = findPO[0][`DATA`][i];
          // break;
          cuslot = cuslot + findPO[0][`DATA`][i][`CUSLOTNO`] + ','
        }
      }


      if (dbsap !== '') {


        let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
        let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
        let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

        let ItemPickout = [];
        let ItemPickcodeout = [];

        for (i = 0; i < findcp[0]['FINAL'].length; i++) {
          for (j = 0; j < masterITEMs.length; j++) {
            if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
              ItemPickout.push(masterITEMs[j]['ITEMs']);
              ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
            }
          }
        }

        let ItemPickoutP2 = []
        let ItemPickcodeoutP2 = [];
        for (i = 0; i < ItemPickcodeout.length; i++) {
          for (j = 0; j < MACHINEmaster.length; j++) {
            if (ItemPickcodeout[i]['METHOD'] === MACHINEmaster[j]['masterID']) {
              if (MACHINEmaster[j]['MACHINE'].includes(NAME_INS)) {
                ItemPickoutP2.push(ItemPickout[i]);
                ItemPickcodeoutP2.push(ItemPickcodeout[i]);
              }
            }
          }
        }
        var picS = "";
        // console.log(findcp[0]['Pimg'])
        if (findcp.length > 0) {
          if (findcp[0]['Pimg'] !== undefined) {
            picS = `${findcp[0]['Pimg'][`P1`]}`
          }

        }



        MAXMINdb = {
          "INS": NAME_INS,
          "PO": input['PO'] || '',
          "CP": input['CP'] || '',
          "MATCP": input['CP'] || '',
          "QTY": dbsap['QUANTITY'] || '',
          "PROCESS": dbsap['PROCESS'] || '',
          // "CUSLOT": dbsap['CUSLOTNO'] || '',
          "CUSLOT": cuslot,
          "TPKLOT": dbsap['FG_CHARG'] || '',
          "FG": dbsap['FG'] || '',
          "CUSTOMER": dbsap['CUSTOMER'] || '',
          "PART": findcp[0]['PART'] || '',
          "PART_s": dbsap['PART'] || '',
          "PARTNAME_s": dbsap['PARTNAME'] || '',
          "PARTNAME": findcp[0]['PARTNAME'] || '',
          "MATERIAL": dbsap['MATERIAL'] || '',
          "MATERIAL_s": dbsap['MATERIAL'] || '',
          //---new
          "QUANTITY": dbsap['QUANTITY'] || '',
          // "PROCESS":dbsap ['PROCESS'] || '',
          // "CUSLOTNO": dbsap['CUSLOTNO'] || '',
          "CUSLOTNO": cuslot,
          "FG_CHARG": dbsap['FG_CHARG'] || '',
          "PARTNAME_PO": dbsap['PARTNAME_PO'] || '',
          "PART_PO": dbsap['PART_PO'] || '',
          "CUSTNAME_s": dbsap['CUST_FULLNM'] || '',
          "CUSTNAME": dbsap['CUST_FULLNM'] || '',
          "UNITSAP": dbsap['UNIT'] || '',
          //----------------------
          "ItemPick": ItemPickoutP2, //---->
          "ItemPickcode": ItemPickcodeoutP2, //---->
          "POINTs": "",
          "PCS": "",
          "PCSleft": "",
          "UNIT": "",
          "INTERSEC": "",
          "RESULTFORMAT": "",
          "GRAPHTYPE": "",
          "GAP": "",
          "GAPname": '',
          "GAPnameList": [],
          "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
          //----------------------
          "preview": [],
          "confirmdata": [],
          "ITEMleftUNIT": [],
          "ITEMleftVALUE": [],
          //
          "MeasurmentFOR": "FINAL",
          "inspectionItem": "", //ITEMpice
          "inspectionItemNAME": "",
          "tool": NAME_INS,
          "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
          "dateupdatevalue": day,
          "INTERSEC_ERR": 0,
          //
          "K1b": '',
          "K1v": '',
          "FORMULA": '',
          "ANSCAL2": '',
          "confirmdataCW": [{
            "VAL1": "",
            "VAL2": "",
            "VAL3": "",
            "VAL4": "",
            "Aear": "",
            "FORMULA": "",
            "var": "",

            'Result1': "",
            'Result2': "",
            'Result': "",
          }],
          //
          "PIC": picS,
          //----------------------
          "USER": input['USER'],
          "USERID": input['USERID'],
        }

        output = 'OK';

        console.log(output);


      } else {
        output = 'NOK';
      }
    } else {
      output = 'NOK';
    }
  } else {
    output = 'NOK';
  }


  //-------------------------------------
  return res.json(output);
});

// router.post('/MAXMIN-geteachITEM', async (req, res) => {
//   //-------------------------------------
//   console.log('--MAXMIN-geteachITEM--');
//   console.log(req.body);
//   let inputB = req.body;

//   let ITEMSS = '';
//   let output = 'NOK';

//   for (i = 0; i < MAXMINdb['ItemPickcode'].length; i++) {
//     if (MAXMINdb['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
//       ITEMSS = MAXMINdb['ItemPickcode'][i]['key'];
//     }
//   }


//   if (ITEMSS !== '') {

//     //-------------------------------------
//     MAXMINdb['inspectionItem'] = ITEMSS;
//     MAXMINdb['inspectionItemNAME'] = inputB['ITEMs'];
//     let input = { 'PO': MAXMINdb["PO"], 'CP': MAXMINdb["CP"], 'ITEMs': MAXMINdb['inspectionItem'] };
//     //-------------------------------------
//     if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
//       let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
//       let UNITdata = await mongodb.find(master_FN, UNIT, {});
//       let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": MAXMINdb['inspectionItem'] });

//       for (i = 0; i < findcp[0]['FINAL'].length; i++) {
//         if (findcp[0]['FINAL'][i]['ITEMs'] === input['ITEMs']) {

//           // output = [{
//           //   "RESULTFORMAT": findcp[0]['FINAL'][i]['RESULTFORMAT'],
//           //   "GRAPHTYPE": findcp[0]['FINAL'][i]['GRAPHTYPE'],
//           //   "INTERSECTION": findcp[0]['FINAL'][i]['INTERSECTION'],
//           //   "DOCUMENT": findcp[0]['FINAL'][i]['DOCUMENT'],
//           //   "SPECIFICATION": findcp[0]['FINAL'][i]['SPECIFICATION'],
//           //   "POINTPCS": findcp[0]['FINAL'][i]['POINTPCS'],
//           //   "POINT": findcp[0]['FINAL'][i]['POINT'],
//           //   "PCS": findcp[0]['FINAL'][i]['PCS'],
//           //   "FREQUENCY": findcp[0]['FINAL'][i]['FREQUENCY'],
//           //   "MODE": findcp[0]['FINAL'][i]['MODE'],
//           //   "REMARK": findcp[0]['FINAL'][i]['REMARK'],
//           //   "LOAD": findcp[0]['FINAL'][i]['LOAD'],
//           //   "CONVERSE": findcp[0]['FINAL'][i]['CONVERSE'],
//           // }]







//           if (masterITEMs.length > 0) {
//             //
//             MAXMINdb["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
//             MAXMINdb["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
//             //------------------------------------

//             let graph = await mongodb.find(PATTERN, GRAPH_TABLE, {});
//             MAXMINdb['GAPnameList'] = [];
//             for (k = 0; k < graph.length; k++) {
//               MAXMINdb['GAPnameList'].push(graph[k]['NO']);
//             }
//           }

//           for (j = 0; j < UNITdata.length; j++) {
//             if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
//               MAXMINdb["UNIT"] = UNITdata[j]['UNIT'];
//             }
//           }

//           console.log(findcp[0]['FINAL'][i]['POINT']);

//           MAXMINdb["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
//           MAXMINdb["PCS"] = findcp[0]['FINAL'][i]['PCS'];
//           MAXMINdb["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];

//           MAXMINdb["INTERSEC"] = masterITEMs[0]['INTERSECTION'];
//           output = 'OK';
//           let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
//           if (findpo.length > 0) {
//             request.post(
//               'http://127.0.0.1:17180/MAXMIN-feedback',
//               { json: { "PO": MAXMINdb['PO'], "ITEMs": MAXMINdb['inspectionItem'] } },
//               function (error, response, body2) {
//                 if (!error && response.statusCode == 200) {
//                   // console.log(body2);
//                   if (body2 === 'OK') {
//                     // output = 'OK';
//                   }
//                 }
//               }
//             );
//           }
//           break;
//         }
//       }
//     }

//   } else {
//     MAXMINdb["POINTs"] = '',
//       MAXMINdb["PCS"] = '',
//       MAXMINdb["PCSleft"] = '',
//       MAXMINdb["UNIT"] = "",
//       MAXMINdb["INTERSEC"] = "",
//       output = 'NOK';
//   }

//   //-------------------------------------
//   return res.json(output);
// });

router.post('/MAXMIN-geteachITEM', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMIN-geteachITEM--');
  console.log(req.body);
  let inputB = req.body;

  let ITEMSS = '';
  let output = 'NOK';

  for (i = 0; i < MAXMINdb['ItemPickcode'].length; i++) {
    if (MAXMINdb['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
      ITEMSS = MAXMINdb['ItemPickcode'][i]['key'];
    }
  }


  if (ITEMSS !== '') {

    //-------------------------------------
    MAXMINdb['inspectionItem'] = ITEMSS;
    MAXMINdb['inspectionItemNAME'] = inputB['ITEMs'];
    let input = { 'PO': MAXMINdb["PO"], 'CP': MAXMINdb["CP"], 'ITEMs': MAXMINdb['inspectionItem'] };
    //-------------------------------------
    if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
      let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
      let UNITdata = await mongodb.find(master_FN, UNIT, {});
      let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": MAXMINdb['inspectionItem'] });

      for (i = 0; i < findcp[0]['FINAL'].length; i++) {
        if (findcp[0]['FINAL'][i]['ITEMs'] === input['ITEMs']) {

          // output = [{
          //   "RESULTFORMAT": findcp[0]['FINAL'][i]['RESULTFORMAT'],
          //   "GRAPHTYPE": findcp[0]['FINAL'][i]['GRAPHTYPE'],
          //   "INTERSECTION": findcp[0]['FINAL'][i]['INTERSECTION'],
          //   "DOCUMENT": findcp[0]['FINAL'][i]['DOCUMENT'],
          //   "SPECIFICATION": findcp[0]['FINAL'][i]['SPECIFICATION'],
          //   "POINTPCS": findcp[0]['FINAL'][i]['POINTPCS'],
          //   "POINT": findcp[0]['FINAL'][i]['POINT'],
          //   "PCS": findcp[0]['FINAL'][i]['PCS'],
          //   "FREQUENCY": findcp[0]['FINAL'][i]['FREQUENCY'],
          //   "MODE": findcp[0]['FINAL'][i]['MODE'],
          //   "REMARK": findcp[0]['FINAL'][i]['REMARK'],
          //   "LOAD": findcp[0]['FINAL'][i]['LOAD'],
          //   "CONVERSE": findcp[0]['FINAL'][i]['CONVERSE'],
          // }]







          if (masterITEMs.length > 0) {
            //

            MAXMINdb["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
            MAXMINdb["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
            //------------------------------------

            let graph = await mongodb.find(PATTERN, GRAPH_TABLE, {});
            MAXMINdb['GAPnameList'] = [];
            for (k = 0; k < graph.length; k++) {
              MAXMINdb['GAPnameList'].push(graph[k]['NO']);
            }
          }

          for (j = 0; j < UNITdata.length; j++) {
            if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
              MAXMINdb["UNIT"] = UNITdata[j]['UNIT'];
            }
          }

          console.log(findcp[0]['FINAL'][i]['POINT']);
          console.log(findcp[0]['FINAL'][i])


          MAXMINdb["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
          MAXMINdb["PCS"] = findcp[0]['FINAL'][i]['PCS'];
          MAXMINdb["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];
          MAXMINdb["shape"] = findcp[0]['FINAL'][i]['shape']

          MAXMINdb["SPEC"] = '';
          if (findcp[0]['FINAL'][i]['SPECIFICATIONve'] !== undefined) {
            if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'BTW') {
              MAXMINdb["SPEC"] = `${findcp[0]['FINAL'][i]['SPECIFICATIONve']['BTW_LOW']}-${findcp[0]['FINAL'][i]['SPECIFICATIONve']['BTW_HI']}`;
            } else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'HIM(>)') {
              MAXMINdb["SPEC"] = `>${findcp[0]['FINAL'][i]['SPECIFICATIONve']['HIM_L']}`;
            } else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'LOL(<)') {
              MAXMINdb["SPEC"] = `<${findcp[0]['FINAL'][i]['SPECIFICATIONve']['LOL_H']}`;
            } else if (findcp[0]['FINAL'][i]['SPECIFICATIONve']['condition'] === 'Actual') {
              MAXMINdb["SPEC"] = 'Actual';
            }
          }

          MAXMINdb["K1b"] = findcp[0]['FINAL'][i]['K1b'];
          MAXMINdb["K1v"] = findcp[0]['FINAL'][i]['K1v'];
          // "FREQUENCY":"",
          MAXMINdb["FREQUENCY"] = findcp[0]['FINAL'][i]['FREQUENCY'];
          console.log(MAXMINdb["FREQUENCY"])

          MAXMINdb["INTERSEC"] = masterITEMs[0]['INTERSECTION'];

          let masterITEMsC = await mongodb.find(master_FN, ITEMs, { "masterID": MAXMINdb['inspectionItem'] });
          console.log(masterITEMsC);
          if (masterITEMsC.length > 0) {

            if (masterITEMsC[0]['CALCULATE'] !== '') {

              let masterCALCULATE = await mongodb.find(master_FN, CAL1, { "masterID": masterITEMsC[0]['CALCULATE'] });
              if (masterCALCULATE.length > 0) {
                console.log(masterCALCULATE[0]);

                MAXMINdb["FORMULA"] = masterCALCULATE[0]["FORMULA"]
              }
            }
          }

          MAXMINdb["ANSCAL2"] = '';

          let date = Date.now()
          let REFLOT = await mongodb.find(PATTERN, "referdata", { "MATCP": MAXMINdb['MATCP'], "ITEMS": ITEMSS, "EXP": { $gt: date } });

          console.log(REFLOT)

          if (REFLOT.length > 0) {
            MAXMINdb["REFLOT"] = REFLOT[0]['TPKLOT'];
          }




          output = 'OK';
          let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
          if (findpo.length > 0) {
            request.post(
              'http://127.0.0.1:17180/FINAL/MAXMIN-feedback',
              { json: { "PO": MAXMINdb['PO'], "ITEMs": MAXMINdb['inspectionItem'] } },
              function (error, response, body2) {
                if (!error && response.statusCode == 200) {
                  // console.log(body2);
                  if (body2 === 'OK') {
                    // output = 'OK';
                  }
                }
              }
            );


          }
          break;
        }
      }
    }

  } else {
    MAXMINdb["POINTs"] = '';
    MAXMINdb["PCS"] = '';
    MAXMINdb["ANSCAL2"] = '';

    MAXMINdb["SPEC"] = '';

    MAXMINdb["PCSleft"] = '';
    MAXMINdb["UNIT"] = "";
    MAXMINdb["INTERSEC"] = "";
    MAXMINdb["RESULTFORMAT"] = "";
    MAXMINdb["K1b"] = "";
    MAXMINdb["K1v"] = "";
    MAXMINdb["FORMULA"] = "";
    output = 'NOK';
    MAXMINdb["FREQUENCY"] = '';
    MAXMINdb["REFLOT"] = '';
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/MAXMIN-geteachGRAPH', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMIN-geteachGRAPH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  try {
    let graph = await mongodb.find(PATTERN, GRAPH_TABLE, { "NO": input['GAPname'] });
    console.log(graph);
    MAXMINdb['GAPnameListdata'] = graph[0];//confirmdata
    MAXMINdb['GAP'] = MAXMINdb['GAPnameListdata'][`GT${MAXMINdb['confirmdata'].length + 1}`]
  }
  catch (err) {

  }
  //-------------------------------------
  return res.json('ok');
});

router.post('/MAXMIN-preview', async (req, res) => {
  //-------------------------------------
  // console.log('--MAXMIN-preview--');
  // console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  if (input.length > 0) {
    if (input[0]['V1'] !== undefined) {
      //-------------------------------------
      try {
        MAXMINdb['preview'] = input;
        output = 'OK';
      }
      catch (err) {
        output = 'NOK';
      }
      //-------------------------------------
    } else {
      output = 'NOK';
    }
  } else {
    MAXMINdb['preview'] = [];
    output = 'clear';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/MAXMIN-confirmdata', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMIN-confirmdata--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {
    let datapush = MAXMINdb['preview'][0]

    if (MAXMINdb['RESULTFORMAT'] === 'Graph') {
      let pushdata = MAXMINdb['preview'][0]

      pushdata['V5'] = MAXMINdb['GAP'];
      pushdata['V1'] = `${MAXMINdb['confirmdata'].length + 1}:${pushdata['V1']}`;

      MAXMINdb['confirmdata'].push(pushdata);
      MAXMINdb['preview'] = [];
      output = 'OK';
      MAXMINdb['GAP'] = MAXMINdb['GAPnameListdata'][`GT${MAXMINdb['confirmdata'].length + 1}`]

    } else if (MAXMINdb['RESULTFORMAT'] === 'Number') {

      let pushdata = MAXMINdb['preview'][0]

      pushdata['V5'] = MAXMINdb['confirmdata'].length + 1
      pushdata['V1'] = `${MAXMINdb['confirmdata'].length + 1}:${pushdata['V1']}`

      MAXMINdb['confirmdata'].push(pushdata);
      MAXMINdb['preview'] = [];
      output = 'OK';
    }
 
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/MAXMIN-confirmdata-set', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMIN-confirmdata-set--');
  console.log(req.body);
  let input = req.body;
  MAXMINdb['confirmdata'] = input;
  //-------------------------------------
  res.json('ok');
});



router.post('/MAXMIN-feedback', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMIN-feedback--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  //-------------------------------------
  if (input["PO"] !== undefined && input["ITEMs"] !== undefined) {
    let feedback = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
    if (feedback.length > 0 && feedback[0]['FINAL'] != undefined && feedback[0]['FINAL'][NAME_INS] != undefined && feedback[0]['FINAL'][NAME_INS][input["ITEMs"]] != undefined) {
      // console.log(Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]));
      let oblist = Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]);
      let ob = feedback[0]['FINAL'][NAME_INS][input["ITEMs"]];


      let LISTbuffer = [];
      let ITEMleftVALUEout = [];

      for (i = 0; i < oblist.length; i++) {
        LISTbuffer.push(...ob[oblist[i]])
      }
      MAXMINdb["PCSleft"] = `${parseInt(MAXMINdb["PCS"]) - oblist.length}`;
      if (MAXMINdb['RESULTFORMAT'] === 'Number' || MAXMINdb['RESULTFORMAT'] === 'Text' || MAXMINdb['RESULTFORMAT'] === 'Graph') {
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] === 'Mean') {
            ITEMleftVALUEout.push({ "V1": 'Mean', "V2": `${LISTbuffer[i]['PO3']}` })
          } else {
            ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO2']}`, "V2": `${LISTbuffer[i]['PO3']}` })
          }

        }


        MAXMINdb["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        MAXMINdb["ITEMleftVALUE"] = ITEMleftVALUEout;

      } else {

      }
      // output = 'OK';
      if ((parseInt(MAXMINdb["PCS"]) - oblist.length) == 0) {
        //CHECKlist
        for (i = 0; i < feedback[0]['CHECKlist'].length; i++) {
          if (input["ITEMs"] === feedback[0]['CHECKlist'][i]['key']) {
            feedback[0]['CHECKlist'][i]['FINISH'] = 'OK';
            // console.log(feedback[0]['CHECKlist']);
            let feedbackupdate = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'CHECKlist': feedback[0]['CHECKlist'] } });
            break;
          }
        }
        //input["ITEMs"] 
        let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": input["ITEMs"] });


        if (feedback[0]['FINAL_ANS'] === undefined) {
          feedback[0]['FINAL_ANS'] = {}
        }
        if (masterITEMs.length > 0) {
          let anslist = [];
          let anslist_con = [];


          if (masterITEMs[0]['RESULTFORMAT'] === 'Number') {
            for (i = 0; i < LISTbuffer.length; i++) {
              if (LISTbuffer[i]['PO1'] === 'Mean') {
                anslist.push(LISTbuffer[i]['PO3'])
                anslist_con.push(LISTbuffer[i]['PO5'])
              }
            }

            let sum1 = anslist.reduce((a, b) => a + b, 0);
            let avg1 = (sum1 / anslist.length) || 0;
            let sum2 = anslist_con.reduce((a, b) => a + b, 0);
            let avg2 = (sum2 / anslist_con.length) || 0;

            feedback[0]['FINAL_ANS'][input["ITEMs"]] = avg1;
            feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_c`] = avg2;

            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Text') {

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Graph') {

            if (MAXMINdb['GRAPHTYPE'] == 'CDE') {

              //
              let axis_data = [];
              for (i = 0; i < LISTbuffer.length; i++) {
                if (LISTbuffer[i]['PO1'] !== 'Mean') {
                  axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
                }
              }
              //-----------------core

              let core = 0;
              if (MAXMINdb['INTERSEC'] !== '') {
                core = parseFloat(MAXMINdb['INTERSEC'])
              } else {
                core = parseFloat(axis_data[axis_data.length - 1]['y'])
              }





              //-----------------core
              let RawPoint = [];
              for (i = 0; i < axis_data.length - 1; i++) {
                if (core <= axis_data[i].y && core >= axis_data[i + 1].y) {
                  RawPoint.push({ Point1: axis_data[i], Point2: axis_data[i + 1] });
                  break
                }
              }

              try {
                let pointvalue = RawPoint[0].Point2.x - RawPoint[0].Point1.x;
                let data2 = RawPoint[0].Point1.y - core;
                let data3 = RawPoint[0].Point1.y - RawPoint[0].Point2.y;

                let RawData = RawPoint[0].Point1.x + (data2 / data3 * pointvalue);
                let graph_ans_X = parseFloat(RawData.toFixed(2));

                feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
                feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": core };

                let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });

              }
              catch (err) {
                MAXMINdb[`INTERSEC_ERR`] = 1;
              }

              //
            } else if (MAXMINdb['GRAPHTYPE'] == 'CDE') {
              let axis_data = [];
              for (i = 0; i < LISTbuffer.length; i++) {
                if (LISTbuffer[i]['PO1'] !== 'Mean') {
                  axis_data.push({ x: parseFloat(LISTbuffer[i].PO8), y: parseFloat(LISTbuffer[i].PO3) });
                }
              }

              let d = []
              for (i = 0; i < axis_data.length - 1; i++) {
                d.push((axis_data[i].y - axis_data[i + 1].y) / (axis_data[i + 1].x - axis_data[i].x));
              }

              let def = []

              for (i = 0; i < d.length - 1; i++) {
                if (d[i] > d[i + 1]) {
                  def[i] = (d[i] - d[i + 1])
                } else {
                  def[i] = (d[i + 1] - d[i])
                }

              }

              for (j = 0; j < def.length; j++) {
                if (def[j] === Math.max(...def)) {
                  pos = [j + 1, j + 2]
                }
              }

              let d1 = -d[pos[0] - 1]
              let d2 = -d[pos[1]]


              let c1 = (axis_data[pos[0]].y - d1 * axis_data[pos[0]].x);
              let c2 = (axis_data[pos[1]].y - d2 * axis_data[pos[1]].x);


              let Xans = 0;
              let Yans = 0;
              let x = (c[1] - c[0]) / (d1 - d2);


              if (x >= 0) {
                Xans = x
              } else {
                Xans = -x
              }

              y = d1 * Xans + c[0]
              Yans = y

              let graph_ans_X = parseFloat(Xans.toFixed(2));
              let graph_ans_Y = parseFloat(Yans.toFixed(2));

              feedback[0]['FINAL_ANS'][input["ITEMs"]] = graph_ans_X;
              feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_point`] = { "x": graph_ans_X, "y": graph_ans_Y };

              let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


            }

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Picture') {
            //
          } else if (masterITEMs[0]['RESULTFORMAT'] === 'OCR') {
            //

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'CAL1') {

            console.log("---CALCULATEDATA---")
            let feedback = await mongodb.find("BUFFERCAL", "DAS01", { "DAS01": "BUFFER" });
            console.log(feedback)
            if (feedback.length > 0) {
              if (feedback[0]['VAL1'] !== '' && feedback[0]['VAL2'] !== '' && feedback[0]['FORMULA'] !== '') {
                console.log("---CALCULATEDATA---????")
                // console.log( feedback[0]['VAL1'])
                // console.log( feedback[0]['VAL2'])
                // console.log( feedback[0]['Area'])
                // console.log( feedback[0]['FORMULA'])

                // console.log(evil(`12/5*9+9.4*2`));

                // let FORMULAdata = feedback[0]['FORMULA'];
                // let VAL1data = feedback[0]['VAL1'];
                // let VAL2data = feedback[0]['VAL2'];
                // let Areadata = feedback[0]['Area'];

                // //X1+Y1+K1

                // let FORMULAresult = FORMULAdata.replace("X", `${VAL1data}`).replace("Y", `${VAL2data}`).replace("K1", `${Areadata}`)
                // console.log(FORMULAresult)
                // let result = evil(FORMULAresult)
                // let finalresult = result;

                // if (result < 0) {
                //   finalresult = - finalresult;
                // }
                // console.log(finalresult)



                // let feedbackres = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
                // feedbackres[0]['FINAL_ANS'][input["ITEMs"]] = finalresult;
                // console.log(feedbackres)
                // let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedbackres[0]['FINAL_ANS'] } });

                // let FORMULAdata = feedback[0]['FORMULA'];
                // let VAL1data = feedback[0]['VAL1'];
                // let VAL2data = feedback[0]['VAL2'];
                // let Areadata = feedback[0]['Area'];

                // let FORMULAresult = FORMULAdata.replace("X", `${VAL1data}`).replace("Y", `${VAL2data}`).replace("K1", `${Areadata}`)
                // console.log(FORMULAresult)
                // let result = evil(FORMULAresult)
                // let finalresult = result;
                // console.log(finalresult)
                // if (result < 0) {
                //   finalresult = - finalresult;
                // }
                // console.log(finalresult)
                // SURBAL013db["ANSCAL2"] = finalresult;
                //inspectionItemNAME
                //ITEMsN

                // if ((`${input["ITEMsN"]}`).toUpperCase().includes("START")) {

                let feedbackres = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
                // console.log(feedbackres)

                if (feedbackres[0]['FINAL_ANS'] === undefined) {
                  feedbackres[0]['FINAL_ANS'] = {}
                  feedbackres[0]['FINAL_ANS'][input["ITEMs"]] = input['Result'];
                  console.log(feedbackres)
                  let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedbackres[0]['FINAL_ANS'] } });
                } else {
                  feedbackres[0]['FINAL_ANS'][input["ITEMs"]] = input['Result'];
                  console.log(feedbackres)
                  let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedbackres[0]['FINAL_ANS'] } });
                }

                // } else if ((`${input["ITEMsN"]}`).toUpperCase().includes("END")) {
                //   let feedbackres = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
                //   // console.log(feedbackres)

                //   if (feedbackres[0]['FINAL_ANS'] === undefined) {
                //     feedbackres[0]['FINAL_ANS'] = {}
                //     feedbackres[0]['FINAL_ANS'][input["ITEMs"]] = "";
                //     console.log(feedbackres)
                //     let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedbackres[0]['FINAL_ANS'] } });
                //   } else {
                //     feedbackres[0]['FINAL_ANS'][input["ITEMs"]] = "";
                //     console.log(feedbackres)
                //     let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedbackres[0]['FINAL_ANS'] } });
                //   }
                // }

                output = 'OK'
              }
            }

          } else {

          }
        }

        let CHECKlistdataFINISH = [];

        for (i = 0; i < feedback[0]['CHECKlist'].length; i++) {
          if (feedback[0]['CHECKlist'][i]['FINISH'] !== undefined) {
            if (feedback[0]['CHECKlist'][i]['FINISH'] === 'OK') {
              CHECKlistdataFINISH.push(feedback[0]['CHECKlist'][i]['key'])
            } else {
            }
          }
        }

        if (CHECKlistdataFINISH.length === feedback[0]['CHECKlist'].length) {
          // feedback[0]['FINAL_ANS']["ALL_DONE"] = "DONE";
          // feedback[0]['FINAL_ANS']["PO_judgment"] ="pass";
          let dataCheck = await axios.post("http://localhost:17180/JUDEMENT", { "PO": MAXMINdb["PO"], "CP": MAXMINdb["CP"] })
          let resultdataCheck = 'pass'
          for (let i = 0; i < dataCheck.length; i++) {
            if (dataCheck[i]['result'] !== 'OK') {
              resultdataCheck = 'no pass';
              break;
            }
          }
          let feedbackupdateFINISH = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { "ALL_DONE": "DONE", "PO_judgment": resultdataCheck, } });
        }

      }
    } else {
      MAXMINdb["ITEMleftUNIT"] = '';
      MAXMINdb["ITEMleftVALUE"] = '';
    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/MAXMIN-SETZERO', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMINfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    MAXMINdb = {
      "INS": NAME_INS,
      "PO": "",
      "CP": "",
      "MATCP": '',
      "QTY": "",
      "PROCESS": "",
      "CUSLOT": "",
      "TPKLOT": "",
      "FG": "",
      "CUSTOMER": "",
      "POINTs": "",
      "PART": "",
      "PARTNAME": "",
      "MATERIAL": "",
      //---new
      "QUANTITY": '',
      // "PROCESS": '',
      "CUSLOTNO": '',
      "FG_CHARG": '',
      "PARTNAME_PO": '',
      "PART_PO": '',
      "CUSTNAME": '',
      //-----
      "ItemPick": [],
      "ItemPickcode": [],
      "PCS": "",
      "PCSleft": "",
      "UNIT": "",
      "INTERSEC": "",
      "RESULTFORMAT": "",
      "GRAPHTYPE": "",
      "GAP": "",
      "GAPname": '',
      "GAPnameList": [],
      "GAPnameListdata": ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      //---------
      "preview": [],
      "confirmdata": [],
      "ITEMleftUNIT": [],
      "ITEMleftVALUE": [],
      //
      "MeasurmentFOR": "FINAL",
      "inspectionItem": "", //ITEMpice
      "inspectionItemNAME": "",
      "tool": NAME_INS,
      "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
      "dateupdatevalue": day,
      "INTERSEC_ERR": 0,
      //
      "K1b": '',
      "K1v": '',
      "FORMULA": '',
      "ANSCAL2": '',
      "confirmdataCW": [{
        "VAL1": "",
        "VAL2": "",
        "VAL3": "",
        "VAL4": "",
        "Aear": "",
        "FORMULA": "",
        "var": "",

        'Result1': "",
        'Result2': "",
        'Result': "",
      }],
      //
      "PIC": "",
      //----------------------
      "USER": "",
      "USERID": "",
    }
    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/MAXMIN-CLEAR', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMINfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    MAXMINdb['preview'] = [];
    MAXMINdb['confirmdata'] = [];

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/MAXMIN-RESETVALUE', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMINfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    let all = MAXMINdb['confirmdata'].length
    if (all > 0) {
      MAXMINdb['confirmdata'].pop();
    }

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

//"value":[],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN


router.post('/MAXMIN-FINISH', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMIN-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  if (MAXMINdb['RESULTFORMAT'] === 'Number' || MAXMINdb['RESULTFORMAT'] === 'Text') {

    MAXMINdb["value"] = [];
    console.log(MAXMINdb["value"]);
    for (i = 0; i < MAXMINdb['confirmdata'].length; i++) {
      MAXMINdb["value"].push({
        "PO1": MAXMINdb["inspectionItemNAME"],
        "PO2": MAXMINdb['confirmdata'][i]['V1'],
        "PO3": MAXMINdb['confirmdata'][i]['V2'],
        "PO4": MAXMINdb['confirmdata'][i]['V3'],
        "PO5": MAXMINdb['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": '-',
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (MAXMINdb["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < MAXMINdb["value"].length; i++) {
        mean01.push(parseFloat(MAXMINdb["value"][i]["PO3"]));
        mean02.push(parseFloat(MAXMINdb["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      MAXMINdb["value"].push({
        "PO1": 'Mean',
        "PO2": MAXMINdb['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": MAXMINdb['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  } else if (MAXMINdb['RESULTFORMAT'] === 'OCR' || MAXMINdb['RESULTFORMAT'] === 'Picture') {

  } else if (MAXMINdb['RESULTFORMAT'] === 'Graph') {

    MAXMINdb["value"] = [];
    for (i = 0; i < MAXMINdb['confirmdata'].length; i++) {
      MAXMINdb["value"].push({
        "PO1": MAXMINdb["inspectionItemNAME"],
        "PO2": MAXMINdb['confirmdata'][i]['V1'],
        "PO3": MAXMINdb['confirmdata'][i]['V2'],
        "PO4": MAXMINdb['confirmdata'][i]['V3'],
        "PO5": MAXMINdb['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": MAXMINdb['confirmdata'][i]['V5'],
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (MAXMINdb["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < MAXMINdb["value"].length; i++) {
        mean01.push(parseFloat(MAXMINdb["value"][i]["PO3"]));
        mean02.push(parseFloat(MAXMINdb["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      MAXMINdb["value"].push({
        "PO1": 'Mean',
        "PO2": MAXMINdb['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": MAXMINdb['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  }

  if (MAXMINdb['RESULTFORMAT'] === 'Number' ||
    MAXMINdb['RESULTFORMAT'] === 'Text' ||
    MAXMINdb['RESULTFORMAT'] === 'OCR' ||
    MAXMINdb['RESULTFORMAT'] === 'Picture' || MAXMINdb['RESULTFORMAT'] === 'Graph') {
    request.post(
      'http://127.0.0.1:17180/FINISHtoDB',
      { json: MAXMINdb },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          MAXMINdb['confirmdata'] = [];
          MAXMINdb["value"] = [];
          //------------------------------------------------------------------------------------

          request.post(
            'http://127.0.0.1:17180/MAXMIN-feedback',
            { json: { "PO": MAXMINdb['PO'], "ITEMs": MAXMINdb['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );

          //------------------------------------------------------------------------------------
          // }

        }
      }
    );
  }
  //-------------------------------------
  return res.json(MAXMINdb);
});


router.post('/MAXMIN-FINISH-CAL1', async (req, res) => {
  //-------------------------------------
  console.log('--MAXMIN-FINISH-CAL1--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';
  if ((MAXMINdb['RESULTFORMAT'] === 'CAL1')) {

    MAXMINdb["value"] = [];
    let feedback = await mongodb.find("BUFFERCAL", "DAS01", { "DAS01": "BUFFER" });

    if (feedback.length > 0) {
      if (feedback[0]['VAL1'] !== '' && feedback[0]['VAL2'] !== '') {
        MAXMINdb["value"].push({
          "VAL1": feedback[0]['VAL1'],
          "VAL2": feedback[0]['VAL2'],
          "VAL3": feedback[0]['VAL3'],
          "VAL4": feedback[0]['VAL4'],
          "Area": feedback[0]['Area'],
          "FORMULA": feedback[0]['FORMULA'],
          "Result": feedback[0]['Result'],
          "Result1": feedback[0]['Result1'],
          "Result2": feedback[0]['Result2'],
        });

        if (MAXMINdb['RESULTFORMAT'] === 'CAL1') {
          request.post(
            'http://127.0.0.1:17180/FINISHtoDB',
            { json: MAXMINdb },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                // console.log(body);
                // if (body === 'OK') {
                MAXMINdb['confirmdata'] = [];
                MAXMINdb["value"] = [];
                //------------------------------------------------------------------------------------
                request.post(
                  'http://127.0.0.1:17180/MAXMIN-feedback',
                  { json: { "PO": MAXMINdb['PO'], "ITEMs": MAXMINdb['inspectionItem'], "ITEMsN": MAXMINdb['inspectionItemNAME'], "Result": input['Result'] } },
                  function (error, response, body2) {
                    if (!error && response.statusCode == 200) {
                      // console.log(body2);
                      // if (body2 === 'OK') {
                      output = 'OK';
                      // }
                    }
                  }
                );
                //------------------------------------------------------------------------------------
                // }

              }
            }
          );
        }
      }
    }



  }

  //-------------------------------------
  return res.json(MAXMINdb);
});



module.exports = router;



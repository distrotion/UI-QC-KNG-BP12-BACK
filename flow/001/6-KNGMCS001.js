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

let NAME_INS = 'KNG-MCS-001'

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';
let UNIT = 'UNIT';

//----------------- dynamic

let finddbbuffer = [{}];

let KNGMCS001db = {
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
  //
  "PIC": "",
   //----------------------
  "USER": "",
  "USERID": "",
}

router.get('/CHECK-KNGMCS001', async (req, res) => {

  return res.json(KNGMCS001db['PO']);
});


router.post('/KNGMCS001db', async (req, res) => {
  //-------------------------------------
  // console.log('--KNGMCS001db--');
  // console.log(req.body);
  //-------------------------------------
  let finddb = [{}];
  try {

    finddb = KNGMCS001db;
    finddbbuffer = finddb;
  }
  catch (err) {
    finddb = finddbbuffer;
  }
  //-------------------------------------
  return res.json(finddb);
});

router.post('/GETINtoKNGMCS001', async (req, res) => {
  //-------------------------------------
  console.log('--GETINtoKNGMCS001--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  check = KNGMCS001db;
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
          cuslot = cuslot+ findPO[0][`DATA`][i][`CUSLOTNO`]+ ','
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
        if(findcp.length >0){
          if(findcp[0]['Pimg'] !== undefined ){
            picS = `${findcp[0]['Pimg'][`P1`]}`
          }
          
        }



        KNGMCS001db = {
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
          "CUSLOTNO":  cuslot,
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
          //
          "PIC": picS,
          //----------------------
          "USER": input['USER'],
          "USERID": input['USERID'],
        }

        output = 'OK';


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

router.post('/KNGMCS001-geteachITEM', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001-geteachITEM--');
  console.log(req.body);
  let inputB = req.body;

  KNGMCS001db["POINTs"] = '';
  KNGMCS001db["PCS"] = '';
  KNGMCS001db["PCSleft"] = '';
  KNGMCS001db["UNIT"] = "";
  KNGMCS001db["INTERSEC"] = "";

  let ITEMSS = '';
  let output = 'NOK';

  for (i = 0; i < KNGMCS001db['ItemPickcode'].length; i++) {
    if (KNGMCS001db['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
      ITEMSS = KNGMCS001db['ItemPickcode'][i]['key'];
    }
  }


  if (ITEMSS !== '') {

    //-------------------------------------
    KNGMCS001db['inspectionItem'] = ITEMSS;
    KNGMCS001db['inspectionItemNAME'] = inputB['ITEMs'];
    let input = { 'PO': KNGMCS001db["PO"], 'CP': KNGMCS001db["CP"], 'ITEMs': KNGMCS001db['inspectionItem'] };
    //-------------------------------------
    if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
      let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
      let UNITdata = await mongodb.find(master_FN, UNIT, {});
      let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": KNGMCS001db['inspectionItem'] });

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
            KNGMCS001db["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
            KNGMCS001db["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
          }

          for (j = 0; j < UNITdata.length; j++) {
            if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
              KNGMCS001db["UNIT"] = UNITdata[j]['UNIT'];
            }
          }

          KNGMCS001db["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
          KNGMCS001db["PCS"] = findcp[0]['FINAL'][i]['PCS'];
          if (KNGMCS001db["PCSleft"] === '') {
            KNGMCS001db["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];
          }

          KNGMCS001db["INTERSEC"] = "";
          output = 'OK';
          let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
          if (findpo.length > 0) {
            request.post(
              'http://127.0.0.1:17180/KNGMCS001-feedback',
              { json: { "PO": KNGMCS001db['PO'], "ITEMs": KNGMCS001db['inspectionItem'] } },
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
    KNGMCS001db["POINTs"] = '',
      KNGMCS001db["PCS"] = '',
      KNGMCS001db["PCSleft"] = '',
      KNGMCS001db["UNIT"] = "",
      KNGMCS001db["INTERSEC"] = "",
      output = 'NOK';
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/KNGMCS001-preview', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001-preview--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  if (input.length > 0) {
    if (input[0]['V1'] !== undefined) {
      //-------------------------------------
      try {
        KNGMCS001db['preview'] = input;
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
    KNGMCS001db['preview'] = [];
    output = 'clear';
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/KNGMCS001-confirmdata', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001-confirmdata--');
  console.log(req.body);
  // let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {
    let datapush = KNGMCS001db['preview'][0]

    if (KNGMCS001db['RESULTFORMAT'] === 'Graph') {

    } else if (KNGMCS001db['RESULTFORMAT'] === 'Number') {

      let pushdata = KNGMCS001db['preview'][0]

      pushdata['V5'] = KNGMCS001db['confirmdata'].length + 1
      pushdata['V1'] = `${KNGMCS001db['confirmdata'].length + 1}:${pushdata['V1']}`

      KNGMCS001db['confirmdata'].push(pushdata);
      KNGMCS001db['preview'] = [];
      output = 'OK';
    }
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});



router.post('/KNGMCS001-feedback', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001-feedback--');
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
      KNGMCS001db["PCSleft"] = `${parseInt(KNGMCS001db["PCS"]) - oblist.length}`;
      if (KNGMCS001db['RESULTFORMAT'] === 'Number') {
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] === 'Mean') {
            ITEMleftVALUEout.push({ "V1": 'Mean', "V2": `${LISTbuffer[i]['PO3']}` })
          } else {
            ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO2']}`, "V2": `${LISTbuffer[i]['PO3']}` })
          }

        }

        KNGMCS001db["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        KNGMCS001db["ITEMleftVALUE"] = ITEMleftVALUEout;

      } else if (KNGMCS001db['RESULTFORMAT'] === 'Text') { //add

        for (i = 0; i < LISTbuffer.length; i++) {
          ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO1']}`, "V2": `${LISTbuffer[i]['PO2']}` })
        }

        KNGMCS001db["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        KNGMCS001db["ITEMleftVALUE"] = ITEMleftVALUEout;

      }
      // output = 'OK';
      if ((parseInt(KNGMCS001db["PCS"]) - oblist.length) == 0) {
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

            feedback[0]['FINAL_ANS'][input["ITEMs"]] = LISTbuffer[0]['PO2'];
            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Graph') {

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Picture') {
            feedback[0]['FINAL_ANS'][input["ITEMs"]] = 'Good';
            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'OCR') {
            feedback[0]['FINAL_ANS'][input["ITEMs"]] = LISTbuffer[0]['PIC1data'];
            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });

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
          let dataCheck = await axios.post("http://localhost:17180/JUDEMENT",{"PO":KNGMCS001db["PO"],"CP":KNGMCS001db["CP"]})
          let resultdataCheck = 'pass'
          for(let i = 0;i<dataCheck.length;i++){
            if(dataCheck[i]['result'] !== 'OK'){
              resultdataCheck = 'no pass';
              break;
            }
          }
          let feedbackupdateFINISH = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { "ALL_DONE": "DONE", "PO_judgment": resultdataCheck, } });
        }

      }
    } else {
      KNGMCS001db["ITEMleftUNIT"] = '';
      KNGMCS001db["ITEMleftVALUE"] = '';
    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/KNGMCS001-SETZERO', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    KNGMCS001db = {
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

router.post('/KNGMCS001-CLEAR', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    KNGMCS001db['preview'] = [];
    KNGMCS001db['confirmdata'] = [];

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/KNGMCS001-RESETVALUE', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001fromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    let all = KNGMCS001db['confirmdata'].length
    if (all > 0) {
      KNGMCS001db['confirmdata'].pop();
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


router.post('/KNGMCS001-FINISH', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  if (KNGMCS001db['RESULTFORMAT'] === 'Number' || KNGMCS001db['RESULTFORMAT'] === 'Text') {

    KNGMCS001db["value"] = [];
    for (i = 0; i < KNGMCS001db['confirmdata'].length; i++) {
      KNGMCS001db["value"].push({
        "PO1": KNGMCS001db["inspectionItemNAME"],
        "PO2": KNGMCS001db['confirmdata'][i]['V1'],
        "PO3": KNGMCS001db['confirmdata'][i]['V2'],
        "PO4": KNGMCS001db['confirmdata'][i]['V3'],
        "PO5": KNGMCS001db['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": "-",
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (KNGMCS001db["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < KNGMCS001db["value"].length; i++) {
        mean01.push(parseFloat(KNGMCS001db["value"][i]["PO3"]));
        mean02.push(parseFloat(KNGMCS001db["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      KNGMCS001db["value"].push({
        "PO1": 'Mean',
        "PO2": KNGMCS001db['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": KNGMCS001db['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  } else if (KNGMCS001db['RESULTFORMAT'] === 'OCR' || KNGMCS001db['RESULTFORMAT'] === 'Picture') {

  } else if (KNGMCS001db['RESULTFORMAT'] === 'Graph') {

  }

  if (KNGMCS001db['RESULTFORMAT'] === 'Number') {
    request.post(
      'http://127.0.0.1:17180/FINISHtoDB',
      { json: KNGMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          KNGMCS001db['confirmdata'] = [];
          KNGMCS001db["value"] = [];
          //------------------------------------------------------------------------------------

          request.post(
            'http://127.0.0.1:17180/KNGMCS001-feedback',
            { json: { "PO": KNGMCS001db['PO'], "ITEMs": KNGMCS001db['inspectionItem'] } },
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
  return res.json(KNGMCS001db);
});


router.post('/KNGMCS001-FINISH-APR', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(KNGMCS001db['PCS']); i++) {

  if (KNGMCS001db['RESULTFORMAT'] === 'Text' && input["APRitem"] !== undefined && input["APRre"] !== undefined) {

    KNGMCS001db["value"] = [];

    KNGMCS001db["value"].push({
      "PO1": input["APRitem"],
      "PO2": input["APRre"],
      "PO3": "-",
      "PO4": "-",
      "PO5": "-",
      "PO6": "-",
      "PO7": "-",
      "PO8": "-",
      "PO9": i + 1,
      "PO10": "AUTO",
    });


  }

  if (KNGMCS001db['RESULTFORMAT'] === 'Text') {
    request.post(
      'http://127.0.0.1:17180/FINISHtoDB',
      { json: KNGMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          KNGMCS001db['confirmdata'] = [];
          KNGMCS001db["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:17180/KNGMCS001-feedback',
            { json: { "PO": KNGMCS001db['PO'], "ITEMs": KNGMCS001db['inspectionItem'] } },
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
  // }


  //-------------------------------------
  return res.json(output);
});

router.post('/KNGMCS001-FINISH-APR', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(KNGMCS001db['PCS']); i++) {

  if (KNGMCS001db['RESULTFORMAT'] === 'Text' && input["APRitem"] !== undefined && input["APRre"] !== undefined) {

    KNGMCS001db["value"] = [];

    KNGMCS001db["value"].push({
      "PO1": input["APRitem"],
      "PO2": input["APRre"],
      "PO3": "-",
      "PO4": "-",
      "PO5": "-",
      "PO6": "-",
      "PO7": "-",
      "PO8": "-",
      "PO9": i + 1,
      "PO10": "AUTO",
    });


  }

  if (KNGMCS001db['RESULTFORMAT'] === 'Text') {
    request.post(
      'http://127.0.0.1:17180/FINISHtoDB',
      { json: KNGMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          KNGMCS001db['confirmdata'] = [];
          KNGMCS001db["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:17180/KNGMCS001-feedback',
            { json: { "PO": KNGMCS001db['PO'], "ITEMs": KNGMCS001db['inspectionItem'] } },
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
  // }




  //-------------------------------------
  return res.json(output);
});


router.post('/KNGMCS001-FINISH-IMG', async (req, res) => {
  //-------------------------------------
  console.log('--KNGMCS001-FINISH--');
  // console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(KNGMCS001db['PCS']); i++) {

  if ((KNGMCS001db['RESULTFORMAT'] === 'OCR' || KNGMCS001db['RESULTFORMAT'] === 'Picture') && input["IMG01"] !== undefined && input["IMG02"] !== undefined && input["IMG03"] !== undefined && input["IMG04"] !== undefined) {

    KNGMCS001db["value"] = [];

    KNGMCS001db["value"].push({
      "PIC1": input["IMG01"],
      "PIC2": input["IMG02"],
      "PIC3": input["IMG03"],
      "PIC4": input["IMG04"],
      "PIC5": input["IMG05"],
      "PIC6": input["IMG06"],
      "PIC7": input["IMG07"],
      "PIC8": input["IMG08"],
      "PIC9": input["IMG09"],
      "PIC10": input["IMG10"],
      "PIC11": input["IMG11"],
      "PIC12": input["IMG12"],


      "PIC1data": input["IMG01data"] || 0,
      "PIC2data": input["IMG02data"] || 0,
      "PIC3data": input["IMG03data"] || 0,
      "PIC4data": input["IMG04data"] || 0,
      "PIC5data": input["IMG05data"] || 0,
      "PIC6data": input["IMG06data"] || 0,
      "PIC7data": input["IMG07data"] || 0,
      "PIC8data": input["IMG08data"] || 0,
      "PIC9data": input["IMG09data"] || 0,
      "PIC10data": input["IMG10data"] || 0,
      "PIC11data": input["IMG11data"] || 0,
      "PIC12data": input["IMG12data"] || 0,

    });


  }

  if (KNGMCS001db['RESULTFORMAT'] === 'OCR' ||
    KNGMCS001db['RESULTFORMAT'] === 'Picture') {
    request.post(
      'http://127.0.0.1:17180/FINISHtoDB',
      { json: KNGMCS001db },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          KNGMCS001db['confirmdata'] = [];
          KNGMCS001db["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:17180/KNGMCS001-feedback',
            { json: { "PO": KNGMCS001db['PO'], "ITEMs": KNGMCS001db['inspectionItem'] } },
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
  return res.json(output);
});

module.exports = router;



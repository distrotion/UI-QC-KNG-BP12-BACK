const express = require("express");
const router = express.Router();

router.use(require("./flow/001/sap"))
router.use(require("./flow/001/getmaster"))
router.use(require("./flow/001/upqcdata"))
router.use(require("./flow/001/1-APPKNG"))
router.use(require("./flow/001/2-GASHMVKNG001"))
router.use(require("./flow/001/3-GASHMVKNG002"))
router.use(require("./flow/001/4-GASHMVKNG003"))
router.use(require("./flow/001/5-SPLINESIZE001"))
router.use(require("./flow/001/6-KNGMCS001"))
router.use(require("./flow/001/7-CTCXTM001"))
router.use(require("./flow/001/8-PVDSCT001"))
router.use(require("./flow/001/9-Refgraph"))
router.use(require("./flow/001/10-BLOCKGAUGE"))
router.use(require("./flow/001/INSFINISH"))
router.use(require("./flow/001/cleardata"))
router.use(require("./flow/001/GRAPHMASTER"))
router.use(require("./flow/001/reportlist"))
router.use(require("./flow/001/TOBEREPORT"))
//reportlist
//INSFINISH
// router.use(require("./flow/004/flow004"))TOBEREPORT
// router.use(require("./flow/005/flow005"))
router.use(require("./flow/testflow/testflow"))

module.exports = router;


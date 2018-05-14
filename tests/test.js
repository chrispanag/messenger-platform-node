const { FB }  = require('../app');
const test = new FB('EAALJmi2qmKUBAOPchm3sRHHGnEJmD7OEBLDCtjsdppY2MQVOVXci1PKqndti4KTZAsDUD7Xr2kCytGau0J8P8qOBcEZBVE8qukMfn15IMRNqS8vQ7XFmZAALChWlutCJupJDwJZC4FyJ7GhrrOXNpfPcFZBoBq7dxfcCP8nzK0wZDZD', "8e2be67bffce2ddb204a8f317ab9efa3");
test.insights().then(rsp => console.log(rsp.data));
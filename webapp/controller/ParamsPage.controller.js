sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	'sap/m/Menu',
	'sap/m/MenuItem',
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"../libs/XLSXlib"
], function(BaseController, MessageBox, Utilities, History, MessageToast, UploadCollectionParameter, Menu, MenuItem, XLSXjs) {
	"use strict";
	var firstEnter = true;
	var initialTable = [];

	return BaseController.extend("com.sap.build.standard.scopeCopy.controller.ParamsPage", {
		handleRouteMatched: function(oEvent) {
			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				var oPath;
				if (this.sContext) {
					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					this.getView().bindObject(oPath);
				}
			}

		},
		_onBeforeUploadStarts: function(oEvent) {
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			setTimeout(function() {
				MessageToast.show("Event beforeUploadStarts triggered");
			}, 4000);
		},
		_onUploadCollectionUploadComplete: function(oEvent) {

			/*var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			setTimeout(function() {
				var oUploadCollection = this.byId("UploadCollection");

				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}
				// delay the success message in order to see other messages before
				MessageToast.show("Event uploadComplete triggered");
			}.bind(this), 8000);*/

			var oFile = oEvent.getParameter("files")[0];
			var iStatus = 200; //oFile ? oFile.status : 500;
			var sResponseRaw = oFile ? oFile.responseRaw : "";
			var oSourceBindingContext = oEvent.getSource().getBindingContext();
			var sSourceEntityId = oSourceBindingContext ? oSourceBindingContext.getProperty("") : null;
			var oModel = this.getView().getModel();

			return new Promise(function(fnResolve, fnReject) {
				if (iStatus !== 200) {
					fnReject(new Error("Upload failed"));
				} else if (oModel.hasPendingChanges()) {
					fnReject(new Error("Please save your changes, first"));
				} else if (!sSourceEntityId) {
					fnReject(new Error("No source entity key"));
				} else {
					try {
						var oResponse = JSON.parse(sResponseRaw);
						var oNewEntityInstance = {};

						oNewEntityInstance[""] = oResponse["ID"];
						oNewEntityInstance[""] = sSourceEntityId;
						oModel.createEntry("", {
							properties: oNewEntityInstance
						});
						oModel.submitChanges({
							success: function(oResponse) {
								var oChangeResponse = oResponse.__batchResponses[0].__changeResponses[0];
								if (oChangeResponse && oChangeResponse.response) {
									oModel.resetChanges();
									fnReject(new Error(oChangeResponse.message));
								} else {
									oModel.refresh();
									fnResolve();
								}
							},
							error: function(oError) {
								fnReject(new Error(oError.message));
							}
						});
					} catch (err) {
						var message = typeof err === "string" ? err : err.message;
						fnReject(new Error("Error: " + message));
					}
				}
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onAddUserDataBtnPress: function(oEvent) {
			var name = (this.getView().byId("FIO").mProperties.value).split(" ");
			if (name.indexOf("") !== -1) {
				name.splice(name.indexOf(""), 1);
			}
			var startDate = (this.getView().byId("DTI1").mProperties.value).split(".");
			var endDate = (this.getView().byId("DTI2").mProperties.value).split(".");
			var role = "Супервайзер";
			var accessRights = "7";
			var id = this.GUID();

			if (name.length > 3 || startDate === "" || endDate === " " || name.length < 2) {
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.m.MessageBox.show(
					"Видимо, вы заполнили не все поля необходимые для добавления нового пользователя", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Добавление пользователя",
						actions: sap.m.MessageBox.Action.OK
					}
				);
				return;
			}

			//adding user data in list t osent it to the backEnd
			var backData = {};
			backData.ID = "6";
			backData.SURNAME = name[0];
			backData.NAME = name[1];
			backData.PATRONYMIC = (name[2]) ? name[2] : "";
			backData.ROLE = role;
			backData.ACCESS = accessRights;
			backData.DATESTART = startDate[0] + "." + startDate[1] + "." + startDate[2];
			backData.DATEEND = endDate[0] + "." + endDate[1] + "." + endDate[2];

			this.backRequest(backData);

			this.getView().byId("userDataTable").getBinding("items").refresh();
		},
		GUID: function() {
			return "xxxxxx".replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0,
					v = c === "x" ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		backRequest: function(tempData) {
			var OData = this.getOwnerComponent().getModel("plants");

			OData.create("/USERS", tempData, null, function() {
					jQuery.sap.require("sap.ui.commons.MessageBox");
					sap.m.MessageBox.show(
						"Добавление пользователя прошло успешно", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Добавление пользователя",
							actions: sap.m.MessageBox.Action.OK
						}
					);
				},
				function() {
					console.log("some errors of adding new user");
					jQuery.sap.require("sap.ui.commons.MessageBox");
					sap.m.MessageBox.show(
						"При добавлении нового пользователя произошли ошибки", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Добавление пользователя",
							actions: sap.m.MessageBox.Action.OK
						}
					);
				}, null, {
					headers: {
						"Access-Control-Allow-Origin": "*"
					}
				});
		},
		_onUploadCollectionChange: function(oEvent) {

			/*var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			MessageToast.show("Event change triggered");*/

			var oUploadCollection = oEvent.getSource();
			var aFiles = oEvent.getParameter('files');

			if (aFiles && aFiles.length) {
				var oFile = aFiles[0];
				var sFileName = oFile.name;

				var oDataModel = this.getView().getModel();
				if (oUploadCollection && sFileName && !oDataModel) {
					var sXsrfToken = "securityTokenFromModel"; //oDataModel.getSecurityToken();
					var oCsrfParameter = new sap.m.UploadCollectionParameter({
						name: "x-csrf-token",
						value: sXsrfToken
					});
					oUploadCollection.addHeaderParameter(oCsrfParameter);
					var oContentDispositionParameter = new sap.m.UploadCollectionParameter({
						name: "content-disposition",
						value: "inline; filename=\"" + encodeURIComponent(sFileName) + "\""
					});
					oUploadCollection.addHeaderParameter(oContentDispositionParameter);
				} else {
					throw new Error("Not enough information available");
				}
			}
		},
		_onUploadCollectionTypeMissmatch: function() {
			return new Promise(function(fnResolve) {
				sap.m.MessageBox.warning("Файл не соответствует разрешенным типам (TXT, XLSX, CSV).", {
					title: "Invalid File Type",
					onClose: function() {
						fnResolve();
					}
				});
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},
		_onUploadCollectionFileSizeExceed: function() {
			return new Promise(function(fnResolve) {
				sap.m.MessageBox.warning("The file you are trying to upload is too large (60MB max).", {
					title: "File Too Large",
					onClose: function() {
						fnResolve();
					}
				});
			}).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err);
				}
			});

		},
		onSelectionChange: function(oEvent) {
			var newSelectedItem = oEvent.getParameters().item.mProperties.key;
			this.getView().byId("HierarchyWizard").setVisible(true);
			/*	this.getView().byId("HierarchyWizard").getProgressStep().mProperties.validated = false;*/

			/*if(newSelectedItem !== this.selectedItem){
				this.selectedItem = newSelectedItem;
			}
			
			if(this.selectedItem === "UserSettings")
			{
				this.getView().byId("HierarchyWizard").setVisible(false);
				this.getView().byId("GoodWizard").setVisible(false);
				this.getView().byId("ShopWizard").setVisible(false);
				
				this.getView().byId("TGyWizard").setVisible(false);
				this.getView().byId("FIO").setVisible(true);
				this.getView().byId("usersLayout").setVisible(true);
				this.getView().byId("DTI1").setVisible(true);
				this.getView().byId("DTI2").setVisible(true);
				this.getView().byId("FioLabel").setVisible(true);
				this.getView().byId("DL1").setVisible(true);
				this.getView().byId("DL2").setVisible(true);
				this.getView().byId("userSubmitBtn").setVisible(true);
				this.getView().byId("userDataTable").setVisible(true);
			}
			else if(this.selectedItem === "TGSettings"){
				this.getView().byId("HierarchyWizard").setVisible(false);
				this.getView().byId("GoodWizard").setVisible(false);
				this.getView().byId("ShopWizard").setVisible(false);
				this.getView().byId("usersLayout").setVisible(false);
				
				this.getView().byId("FIO").setVisible(false);
				this.getView().byId("DTI1").setVisible(false);
				this.getView().byId("DTI2").setVisible(false);
				this.getView().byId("DL1").setVisible(false);
				this.getView().byId("FioLabel").setVisible(false);
				this.getView().byId("DL2").setVisible(false);
				this.getView().byId("userSubmitBtn").setVisible(false);
				this.getView().byId("userDataTable").setVisible(false);
				
				this.getView().byId("TGyWizard").setVisible(true);
				
			}
			else if(this.selectedItem === "HierarchySettings"){
			}*/
			//Надо сделать проверку, создавалась ли иерархия, если да, то не создавать ее заново.

			//Building a base hierarchy if no files are uploaded
			var root = [];
			/*var Node = {
				ID: "0",
				LANGUAGE_C: "RU",
				Description: "Нераспределенные",
				LONG_TEXT: "Нераспределенные",
				HIERARCHY_C: "1",
				ParentNodeID: "",
				// Type for verification adding new node
				Type: "0",
				LEVEL: "0",
				__metadata: ""
			};*/

			root.push(Node);
			console.log("onSelectionChange: "+ root);
			this.buildHierarchy(root);
			//

			/*	this.getView().byId("TGyWizard").setVisible(false);
				this.getView().byId("GoodWizard").setVisible(false);
				this.getView().byId("usersLayout").setVisible(false);
				this.getView().byId("ShopWizard").setVisible(false);
				this.getView().byId("HierarchyWizard").setVisible(true);
				
				this.getView().byId("FIO").setVisible(false);
				this.getView().byId("DTI1").setVisible(false);
				this.getView().byId("DTI2").setVisible(false);
				this.getView().byId("DL1").setVisible(false);
				this.getView().byId("FioLabel").setVisible(false);
				this.getView().byId("DL2").setVisible(false);
				this.getView().byId("userSubmitBtn").setVisible(false);
				this.getView().byId("userDataTable").setVisible(false);
			}
			else if(this.selectedItem === "GoodsSettings"){
				this.getView().byId("TGyWizard").setVisible(false);
				this.getView().byId("HierarchyWizard").setVisible(false);
				this.getView().byId("usersLayout").setVisible(false);
				this.getView().byId("ShopWizard").setVisible(false);
				this.getView().byId("GoodWizard").setVisible(true);
				
				this.getView().byId("FIO").setVisible(false);
				this.getView().byId("DTI1").setVisible(false);
				this.getView().byId("DTI2").setVisible(false);
				this.getView().byId("DL1").setVisible(false);
				this.getView().byId("FioLabel").setVisible(false);
				this.getView().byId("DL2").setVisible(false);
				this.getView().byId("userSubmitBtn").setVisible(false);
				this.getView().byId("userDataTable").setVisible(false);
			}
			else if(this.selectedItem !== "GoodsSettings"){
				this.getView().byId("HierarchyWizard").setVisible(false);
				this.getView().byId("GoodWizard").setVisible(false);
				this.getView().byId("usersLayout").setVisible(false);
				this.getView().byId("ShopWizard").setVisible(true);
				this.getView().byId("TGyWizard").setVisible(false);
				//this.getView().byId("handleDataTextArea").setVisible(false);
				this.getView().byId("FIO").setVisible(false);
				this.getView().byId("DTI1").setVisible(false);
				this.getView().byId("DTI2").setVisible(false);
				this.getView().byId("FioLabel").setVisible(false);
				this.getView().byId("DL1").setVisible(false);
				this.getView().byId("DL2").setVisible(false);
				this.getView().byId("userSubmitBtn").setVisible(false);
				this.getView().byId("userDataTable").setVisible(false);
			}*/
			/*else if(this.selectedItem !== "ShopsSettings"){
				
			}*/
			/*else{
				console.log("Your btn press is not declared");
			}*/
		},
		setPage: function(page) {
			this.pageFrom = page;
		},
		recursionHierarchyRead: function(data, flat) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].hasOwnProperty("children") && data[i].children !== []) {
					flat.push(data[i]);
					this.recursionHierarchyRead(data[i].children, flat);
				} else {
					flat.push(data[i]);
				}
			}
			return flat;
		},
		OnSaveBtnPress: function() {
			console.log("Savepress");
			var TreeTable = this.getView().byId("treeTableHier");
			var data = TreeTable.getBinding().oModel.oData.root;
			var ToSendData = [];
			var flat = [];
			ToSendData.push(this.recursionHierarchyRead(data, flat));
			this.SendHierarchyInfo(ToSendData[0]);

		},
		SendHierarchyInfo: function(ToSendData) {
			//console.log(this.getView().getModel('plants'));
			var oModel = this.getView().getModel('plants');
			for (var i = 0; i < ToSendData.length; i++) {
				var StructObj = {};
				var InfoObj = {};
				StructObj.HIERARCHY_C = ToSendData[i].HIERARCHY_C;
				StructObj.NODE_C = ToSendData[i].ID;
				StructObj.PARENT_C = ToSendData[i].ParentNodeID;
				StructObj.NODE_TYPE = ToSendData[i].Type;
				StructObj.LEVEL = ToSendData[i].LEVEL;
				InfoObj.NODE_C = ToSendData[i].ID;
				InfoObj.LANGUAGE_C = ToSendData[i].LANGUAGE_C;
				InfoObj.SHORT_TEXT = ToSendData[i].Description;
				InfoObj.LONG_TEXT = ToSendData[i].LONG_TEXT;

				// oModel.create('/CON', StructObj, null, function(){
				//     },function(){console.log(StructObj);
				// });
				// oModel.create('/NUM', InfoObj, null, function(){
				//     },function(){
				//       console.log(InfoObj);
				// });
			}

		},
		onInit: function() {
			this.selectedTreeTableItem;
			this.idNewNode;
			this.oDataSelect;
			this.NODE_C;
			this.PARENT_C;
			this.Type;
			this.LANGUAGE_C;
			this.HIERARCHY_C;
			this.LEVEL;
			this.SHORT_TEXT;
			
			this.getView().addEventDelegate({
				onAfterShow: function(evt) {
					evt.to.getController().setPage(evt.from);
				}
			});

			// console.log(this.getView().getViewData()());
			this._HierarchyObj = {
				HierarchyMain: "",
				HierarchyAdd: ""
			};
			this.LastId = 0;
			/*this.getView().byId("stStep").setEnabled(false);
			this.getView().byId("ndStep").setEnabled(false);*/
			this.getView().byId("idfileUploader").setEnabled(true);
			this.getView().byId("addFolderBtn").setEnabled(true);
			this.getView().byId("addShopBtn").setEnabled(false);
			this.getView().byId("deleteNodeBtn").setEnabled(false);
			this.getView().byId("editBtn").setEnabled(false);
			/*this.getView().byId("usersLayout").setVisible(false);*/

			this._HierarchyWizard = this.byId("HierarchyWizard");
			this._TGWizard = this.byId("TGyWizard");

			this.selectedItem = "HierarchySettings";
			this._oBusyDialog = new sap.m.BusyDialog();
			// this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("ParamsPage").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			// var oModel = sap.ui.getCore().getModel("plants");
			//var oModel = this.getOwnerComponent().getModel("plants");
		//Надо сделать проверку, создавалась ли иерархия, если да, то не создавать ее заново.

				this.tableBindItems();
		},
		tableBindItems: function() {
			/*var oModel = sap.ui.getCore().getModel("plants");*/
			//var oModel = this.getOwnerComponent().getModel("plants");
			//Надо сделать проверку, создавалась ли иерархия, если да, то не создавать ее заново.

			//Building a base hierarchy if no files are uploaded
			var root = [];
		
			console.log("TableBindItems"+root);
			this.buildHierarchy(root);
		},
		UploadRadioChange: function(e) {
			//var txt = e.getSource().getButtons()[e.getParameter("selectedIndex")].getText()
			var idx = e.getParameter("selectedIndex");
			if (idx == 1) {
				this.getView().byId("FormDownloadBtnLabel").setVisible(false);
				this.getView().byId("FormDownloadBtn").setVisible(false);
				this.getView().byId("ShopTable").setVisible(true);
				this.ShowHandleTable();
			} else {
				this.getView().byId("FormDownloadBtnLabel").setVisible(true);
				this.getView().byId("FormDownloadBtn").setVisible(true);
				this.getView().byId("ShopTable").setVisible(false);
			}
		},
		ShowHandleTable: function(e) {
			var oModel1 = sap.ui.getCore().getModel("plants");
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oTable = this.getView().byId("ShopTable");
			var this1 = this;
			oModel1.read("/PLANTS", null, [], true,
				function(oData, oResponse) {
					var data = oData.results;
					console.log("DATA");
					console.log(data);
					var resColumns = data[0];
					Object.keys(resColumns).forEach(function(key, index) {
						console.log(resColumns[key]);
						if (resColumns[key] != null && key !== "__metadata") {
							console.log(resColumns[key]);
							var oColumn = new sap.ui.table.Column({
								label: new sap.ui.commons.Label({
									text: key
								}),
								template: new sap.ui.commons.TextField().bindProperty("value", key)
							});
							oTable.addColumn(oColumn);
						}
					});
					oJSModel1.setData(data);
					oTable.setModel(oJSModel1);
					oTable.bindRows({
						path: "/"
					});
				},
				function(oError) {
					console.log(oError);
				});
		},
		FormDownloadPress: function(e) {
			this.getView().byId("UploadBoxLabel").setVisible(true);
			this.getView().byId("UploadBox").setVisible(true);
		},
		onShopChangeFUP: function(e) {
			this._Shopimport(e.getParameter("files") && e.getParameter("files")[0]);
			this.getView().byId("ShopTable").setVisible(true);
		},
		_Shopimport: function(file) {
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var ShopTable = this.getView().byId("ShopTable").setModel(oJSModel1);
			if (file && window.FileReader) {
				var reader = new FileReader();
				var result = {},
					data;
				reader.onload = function(e) {
					data = e.target.result;
					var wb = XLSX.read(data, {
						type: 'binary'
					});
					wb.SheetNames.forEach(function(sheetName) {
						var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
						if (roa.length > 0) {
							result[sheetName] = roa;
						}
					});
					var resColumns = result.Sheet1[0];
					Object.keys(resColumns).forEach(function(key, index) {
						var oColumn = new sap.ui.table.Column({
							label: new sap.ui.commons.Label({
								text: key
							}),
							template: new sap.ui.commons.TextField().bindProperty("value", key)
						});
						ShopTable.addColumn(oColumn);
					});
					console.log(result);
					oJSModel1.setData(result);
					ShopTable.setModel(oJSModel1);
					ShopTable.bindRows({
						path: '/Sheet1'
					});
				};
				reader.readAsBinaryString(file);
			}
		},

		onAddFolder: function(oEvent) {
			if (!this._DialogAddFolder) {
				this._DialogAddFolder = sap.ui.xmlfragment("AddFolder", "com.sap.build.standard.scopeCopy.view.AddFolder", this);
			}
			
			this._DialogAddFolder.open();
		},
		
		onCloseAddFolder: function() {
			this.OnSaveBtnPress();
			this._DialogAddFolder.close();
		},


		onDeleteNode: function(oEvent) {
			var LONG_TEXT = this.oDataSelect.LONG_TEXT;
			console.log(LONG_TEXT);

			/*oLabel.setText(aDescription);*/
			if (!this._DialogDeleteNode) {
				this._DialogDeleteNode = sap.ui.xmlfragment("DeleteNode", "com.sap.build.standard.scopeCopy.view.DeleteNode", this);
			}
			var oLabel = sap.ui.core.Fragment.byId("DeleteNode", "DescriptionNode");
			oLabel.setText(LONG_TEXT);
			var oCancelBtn = sap.ui.core.Fragment.byId("DeleteNode", "closeBtn");
			var oDeleteNodeDialog = sap.ui.core.Fragment.byId("DeleteNode", "deleteNodeDialog");
			
			this._DialogDeleteNode.open();
			
		},

		onCloseDeleteNode: function() {
			this.OnSaveBtnPress();
			this._DialogDeleteNode.close();
		},


		onAddShop: function(oEvent) {
			if (!this._DialogAddShops) {
				this._DialogAddShops = sap.ui.xmlfragment("AddShops", "com.sap.build.standard.scopeCopy.view.AddShops", this);
			}

			var mainPageTable = sap.ui.core.Fragment.byId("AddShops", "mainPageTable");
			var root=[];
			this.buildSecondaryHierarchy(root);
			
		},

		onCloseAddShops: function() {
			this.OnSaveBtnPress();
			this._DialogAddShops.close();
		},
		
		onEditNodeDialog: function(){
			var LONG_TEXT = this.oDataSelect.LONG_TEXT;
			if (!this._DialogEditNode) {
				this._DialogEditNode = sap.ui.xmlfragment("EditNode", "com.sap.build.standard.scopeCopy.view.EditNode", this);
			}
			var oText = sap.ui.core.Fragment.byId("EditNode", "EditLONG_TEXT");
			oText.setValue(LONG_TEXT);
			this._DialogEditNode.open();
		},
		
		onEditNode: function(){
			var oEntry = {};
			var oData = sap.ui.getCore().getModel("plants");
			
	/*	"HIERARCHY_C": "1",
        "NODE_C": "0",
        "PARENT_C": "",
        "NODE_TYPE": 0,
        "LEVEL": "0",
        "LANGUAGE_C": "RU",
        "SHORT_TEXT": "Нераспределенные",
        "LONG_TEXT": "Нераспределенные"*/
	
			
			this.LONG_TEXT = sap.ui.core.Fragment.byId("EditNode", "EditLONG_TEXT").getValue();
			var NODE_C = parseInt(oEntry.NODE_C);
			
			var StructObj = {};
			var InfoObj = {};
				StructObj.HIERARCHY_C =  this.HIERARCHY_C;
				StructObj.NODE_C = this.NODE_C;
				StructObj.PARENT_C = this.PARENT_C;
				StructObj.NODE_TYPE = this.Type;
				StructObj.LEVEL = this.LEVEL;
				InfoObj.NODE_C = this.NODE_C;
				InfoObj.LANGUAGE_C = this.LANGUAGE_C;
				InfoObj.SHORT_TEXT =this.LONG_TEXT.substring(0, 16);
				InfoObj.LONG_TEXT = this.LONG_TEXT;
					
				 oData.update("/CON(HIERARCHY_C='"+StructObj.HIERARCHY_C+"',NODE_C='"+StructObj.NODE_C+"',NODE_TYPE="+StructObj.NODE_TYPE+")", StructObj, null, function(){
				     },function(){console.log(StructObj);
				 });
				 oData.update("/NUM(NODE_C='" + InfoObj.NODE_C+"',LANGUAGE_C='"+InfoObj.LANGUAGE_C+"')", InfoObj, null, function(){
				     },function(){console.log(InfoObj);
				 });
				 
			this.tableBindItems();
			this._DialogEditNode.close();
		},
		
		onCloseEditNode: function() {
			this.OnSaveBtnPress();
			this._DialogEditNode.close();
		},

		// getting the index of the pressed table row
		onCellClick: function(oEvent) {
			this.showObject(oEvent.getParameters());
		},
		
		showObject: function(oParameters) {
			var yourTableObject = this.byId("treeTableHier");
			var rowIndex = oParameters.rowIndex;
			this.selectedTreeTableItem = rowIndex;
			var colIndex = oParameters.columnIndex;
			var sPath = yourTableObject.getContextByIndex(rowIndex).sPath;
			var oDataSelect = yourTableObject.getContextByIndex(rowIndex).oModel.getProperty(sPath);
			var Type = oDataSelect.Type;
			var Plant = oDataSelect.NODE_C;
			this.SHORT_TEXT=oDataSelect.Description;
			this.LONG_TEXT=oDataSelect.LONG_TEXT;
			
			/*var NODE_C = oDataSelect.NODE_C;
			NODE_C = parseInt(NODE_C);*/
			/*Type = parseInt(Type);*/
			this.NODE_C=oDataSelect.NODE_C;
			this.Type=Type;
			this.PARENT_C=oDataSelect.PARENT_C;
			this.LANGUAGE_C=oDataSelect.LANGUAGE_C;
			this.HIERARCHY_C=oDataSelect.HIERARCHY_C;
			this.LEVEL=oDataSelect.LEVEL;
			
			
			
			this.enableBtn(Type);
			this.oDataSelect = yourTableObject.getContextByIndex(rowIndex).oModel.getProperty(sPath);
			console.log("Plant: "+ Plant +" Строка: " + rowIndex + " столбец: " + colIndex + " Type: " + Type + " " + "ParentNodeID " + oDataSelect.ParentNodeID +
				" " + oDataSelect + " " + sPath + " "+ " this.LONG_TEXT: " +this.LONG_TEXT + " oDataSelect.Description: " + oDataSelect.Description);
		},
		
		_onSearchFieldLiveChange: function(oEvent) {
		
			var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");

			var treeTable = sap.ui.core.Fragment.byId("AddShops", "mainPageTable");
			var aFilters = [];
			if (firstEnter===true) {
			for (var i=0; i<treeTable.getRows().length; i++) {
					initialTable.push(treeTable.getRows()[i].getCells()[0].getText());
					firstEnter=false;
				}
			}

			if (sQuery && sQuery.length > 0) {
				//path = "/VIEW_COLUMNS_RES?$filter=(substringof('"+sQuery+"',ADDRESS) or substringof('"+sQuery+"',PLANT))";

			var newQuery = sQuery[0].toUpperCase() + sQuery.slice(1);
			var filter = new sap.ui.model.Filter("LONG_TEXT", sap.ui.model.FilterOperator.Contains, sQuery);
			filter.fnTest=function(row){
					var address='';
					var id='';
					for (i=0; i<initialTable.length; i++) {
						if (row===initialTable[i].toUpperCase()) {
							address=initialTable[i].slice(8);
							for(var j=0; j<address.length; j++) {
								if (address[j]===' ') {
									id=address.slice(0,j);
									break;
								}
							}
						}
					}
					var idInRow=false;
					if (id.includes(newQuery) === true) {idInRow=true; return row;}
					if (address.includes(newQuery) === true && isNaN(parseInt(address[address.search(newQuery)-1])) === true && idInRow===false &&
					isNaN(parseInt(newQuery)) === true) {	return row;}
					};
			aFilters.push(filter);
			//aFilters.push(filter2);
			// update list binding
		
			var binding = treeTable.getBinding("rows");
			binding.filter(aFilters);
			console.log(treeTable.getBinding("rows"));
			}
			 else {
			this.tableBindItems();
		  }
		},
		
		
		

		enableBtn: function(Type) {
			if (Type === 2) {
				this.getView().byId("addFolderBtn").setEnabled(false);
				this.getView().byId("addShopBtn").setEnabled(false);
				this.getView().byId("editBtn").setEnabled(true);
				this.getView().byId("deleteNodeBtn").setEnabled(true);
			} else {
				this.getView().byId("addFolderBtn").setEnabled(true);
				this.getView().byId("addShopBtn").setEnabled(true);
				this.getView().byId("editBtn").setEnabled(true);
				this.getView().byId("deleteNodeBtn").setEnabled(true);
			}
		},

		onMenuAddpress: function(oEvent) {
			var oDragSession = oEvent.getParameter("dragSession");
			console.log(oDragSession);
			var Name = sap.ui.core.Fragment.byId("AddFolder", "AddFolderName").getValue();
			sap.ui.core.Fragment.byId("AddFolder", "AddFolderName").setValue("");
			var oTreeTable = this.byId("treeTableHier");
			var aIdNewNode = this.idNewNode;
			var aSelectedIndices = this.selectedTreeTableItem;
			var oModel = oTreeTable.getBinding("rows").getModel();
			var oContext = oTreeTable.getContextByIndex(aSelectedIndices);
			console.log(oContext);
			/*var oData = oContext.getProperty();*/

			// verification adding new node
			// type = 2, if shop node
			// type !=2 another situations
			//idNewNode = oContext.getProperty("Type")
			try {
				var ParentNodeID = oContext.getPath();
				console.log(ParentNodeID);

				// Здесь можно будет сделать проверку на то
				// есть ли потомки с таким же id у родителя
				/*if (ParentNodeID === undefined) {
						this.idNewNode=0;
						aIdNewNode = 0;
						oModel.setProperty( "root"+"/" + (aIdNewNode++), {
						Description: Name,
						Type: "0",
						ID: aIdNewNode,
						HIERARCHY_C:"1",
						ParentNodeID: "",
					    LEVEL:"0",
						__metadata: ""
					}, oContext, true);
					}
					else{*/
				var Type = this.oDataSelect.Type;
				Type = parseInt(Type);
				if (Type !== 2) {
					if (aIdNewNode === undefined) {
						aIdNewNode = 0;
					}
					var ParentNodeID = oContext.getPath();

					// Create a new folder node
					oModel.setProperty(ParentNodeID + "/" + (aIdNewNode), {
						Description: Name,
						LONG_TEXT: Name,
						Type: "1",
						ID: aIdNewNode,
						ParentNodeID: ParentNodeID.toString().slice(-1),
						__metadata: ""
					}, oContext, true);
					aIdNewNode++;
					this.idNewNode = aIdNewNode;
					var s = oContext.getPath();
					console.log(s.slice(-1));
					console.log(oContext.getPath());
				}
			} catch(err) {
				//меняется не глобальная переменная
				if (aIdNewNode === undefined) {
					aIdNewNode = 1;
				}
				console.log("CATCH");
				oModel.setProperty("/" + aIdNewNode, {
					Description: Name,
					LONG_TEXT: Name,
					Type: "0",
					ID: aIdNewNode,
					ParentNodeID: "",
					HIERARCHY_C: "1",
					LEVEL: "0",
					__metadata: ""
				}, oContext, true);
				aIdNewNode++;

			}

			this.onCloseAddFolder();

		},
		onMenuDeletepress: function(oEvent) {
			/*var p=oEvent.getSource().oParent.oParent.oBindingContexts.undefined.sPath;*/
			var oTreeTable = this.byId("treeTableHier");
			var aSelectedIndices = this.selectedTreeTableItem;
			var oModel = oTreeTable.getBinding("rows").getModel();

			// Cut the data.
			var oContext = oTreeTable.getContextByIndex(aSelectedIndices);
			var oData = oContext.getProperty();

			if (oData) {
				// this._aClipboardData.push(oContext.getProperty());

				// The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
				oModel.setProperty(oContext.getPath(), undefined, oContext, true);
			}
			this.onCloseDeleteNode();
		},
		handleMenuItemPress: function(oEvent) {
			if (oEvent.getParameter("item").getText() === "Добавить узел") {
				this.onMenuAddpress(oEvent);
			} else {
				this.onMenuDeletepress(oEvent);
			}
		},
		onDragStart: function(oEvent) {
			var oTreeTable = this.byId("treeTableHier");
			var oDragSession = oEvent.getParameter("dragSession");
			console.log(oDragSession);
			var oDraggedRow = oEvent.getParameter("target");
			var iDraggedRowIndex = oDraggedRow.getIndex();
			var aSelectedIndices = oTreeTable.getSelectedIndices();
			var aDraggedRowContexts = [];

			if (aSelectedIndices.length > 0) {
				// If rows are selected, do not allow to start dragging from a row which is not selected.
				if (aSelectedIndices.indexOf(iDraggedRowIndex) === -1) {
					oEvent.preventDefault();
				} else {
					for (var i = 0; i < aSelectedIndices.length; i++) {
						aDraggedRowContexts.push(oTreeTable.getContextByIndex(aSelectedIndices[i]));
					}
				}
			} else {
				aDraggedRowContexts.push(oTreeTable.getContextByIndex(iDraggedRowIndex));
			}
			oDragSession.setComplexData("mydrop", {
				draggedRowContexts: aDraggedRowContexts
			});
			console.log(oDragSession.getComplexData("mydrop"));
			console.log("Выполнился Start");
		},

		onDrop: function(oEvent) {
			var oTreeTable = this.byId("treeTableHier");
			var oDragSession = oEvent.getParameter("dragSession");
			var oDroppedRow = oEvent.getParameter("droppedControl");
			console.log(oDroppedRow);
			var aDraggedRowContexts = oDragSession.getComplexData("mydrop").draggedRowContexts;
			var oNewParentContext = oTreeTable.getContextByIndex(oDroppedRow.getIndex());

			console.log("Выполнился Drop");
			console.log(oDroppedRow + " oDroppedRow");
			console.log("oDroppedRow.getIndex() " + oDroppedRow.getIndex());

			if (aDraggedRowContexts.length === 0 || !oNewParentContext) {
				return;
			}

			var oModel = oTreeTable.getBinding("rows").getModel();
			console.log('oTreeTable.getBinding("rows")' + oTreeTable.getBinding("rows") + "/n");
			console.log('oTreeTable.getBinding("rows").getModel()' + oTreeTable.getBinding("rows").getModel());
			var oNewParent = oNewParentContext.getProperty();
			console.log("Данные элемента в который перемещают");
			console.log("oNewParent " + oNewParent.Description);
			console.log("oModel " + oModel);

			// In the JSON data of this example the children of a node are inside an array with the name "childrens".
			if (!oNewParent.children) {
				oNewParent.children = []; // Initialize the children array.
			}

			for (var i = 0; i < aDraggedRowContexts.length; i++) {
				if (oNewParentContext.getPath().indexOf(aDraggedRowContexts[i].getPath()) === 0) {
					// Avoid moving a node into one of its child nodes.
					continue;
				}
				console.log("ИТЫЙ ЭЛЕМЕНТ aDraggedRowContexts " + aDraggedRowContexts[i]);
				// Copy the data to the new parent.
				oNewParent.children.push(aDraggedRowContexts[i].getProperty());
				console.log("aDraggedRowContexts[i].getProperty().Description " + aDraggedRowContexts[i].getProperty().Description);
				// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
				oModel.setProperty(aDraggedRowContexts[i].getPath(), undefined, aDraggedRowContexts[i], true);
			}
			this.OnSaveBtnPress();
		},
		onChangeFUP: function(e) {
			
			var input = "";
			switch (this.selectedItem) {
				case "HierarchySettings":
					input = "idfileUploader";
					break;
				case "TGSettings":
					input = "TGidfileUploader";
					break;
				default:
					input = "HierarchySettings";
					break;
			}
			if (this.getView().byId(input).mProperties.value === "") {
				/*this.getView().byId("stStep").setEnabled(false);*/
				var msg = new sap.m.Text({text: "{i18n>NoFileSelected}"});
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					msg,
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			} else if ((this.getView().byId(input).mProperties.value).split(".")[1] !== "csv") {
				var msg = new sap.m.Text({text: "{i18n>SuccesHierMsg}"});
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					"Видимо, вы выбрали не поддерживаемый файл",
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			}
			console.log("ВА-ва-ВА");
			/*this.getView().byId("stStep").setEnabled(true);*/
			
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		/*	this.getView().byId("idfileUploader").setEnabled(false);*/
			// var msg="{i18n>SuccesHierMsg}";
			var msg = new sap.m.Text({text: "{i18n>SuccesHierMsg}"});
			sap.m.MessageBox.show(msg, {
				actions: [sap.m.MessageBox.Action.YES],
            duration: 3000, animationDuration: 2000
          });
			
		},
		_import: function(file) {
			var that = this;
			if (file && window.FileReader) {
				var reader = new FileReader();
				this.handleOnLoad = this.handleOnLoad.bind(this);
				reader.onload = this.handleOnLoad;
				reader.readAsText(file);

			}
		},
		handleOnLoad: function(e) {
			var strCSV = e.target.result; //string in CSV
			strCSV = strCSV.split('\n');
			for (var i in strCSV) {
				strCSV[i] = strCSV[i].split(';');
			}
			strCSV.splice(0, 1);
			strCSV.splice(strCSV.length - 1, 1);
			this._HierarchyObj.HierarchyMain = strCSV;
		},
		onChangeFUP2: function(e) {
			var input = "";
			switch (this.selectedItem) {
				case "HierarchySettings":
					input = "idfileUploader2";
					break;
				case "TGSettings":
					input = "TGidfileUploader2";
					break;
				default:
					input = "idfileUploader2";
					break;
			}

			if (this.getView().byId(input).mProperties.value === "") {
				/*this.getView().byId("stStep").setEnabled(false);*/
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					"Видимо, вы не выбрали файл для загрузки",
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			} else if ((this.getView().byId(input).mProperties.value).split(".")[1] !== "csv") {
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					"Видимо, вы выбрали не поддерживаемый файл",
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			}
			/*this.getView().byId("ndStep").setEnabled(true);*/

			this._import2(e.getParameter("files") && e.getParameter("files")[0]);
		
			
		},
		_import2: function(file) {
			if (file && window.FileReader) {
				var reader = new FileReader();
				this.handleOnLoad2 = this.handleOnLoad2.bind(this);
				reader.onload = this.handleOnLoad2;
				reader.readAsText(file);
			}
		},
		handleOnLoad2: function(e) {
			var strCSV = e.target.result; //string in CSV
			strCSV = strCSV.split('\n');
			for (var i in strCSV) {
				strCSV[i] = strCSV[i].split(';');
			}
			strCSV.splice(0, 1);
			strCSV.splice(strCSV.length - 1, 1);
			this._HierarchyObj.HierarchyAdd = strCSV;
			this.onUpload2();
			console.log("HierarchyAdd "+ strCSV);
		},
		onUpload: function(oEvent) {
			switch (this.selectedItem) {
				case "HierarchySettings":
					this._HierarchyWizard.nextStep();
					break;
				case "TGSettings":
					this._TGWizard.nextStep();
					break;
				default:
					this._HierarchyWizard.nextStep();
					break;
			}

		},
		onUpload2: function() {
			this.buildHierarchy = this.buildHierarchy.bind(this);
			if (this._HierarchyObj.HierarchyAdd.length === this._HierarchyObj.HierarchyMain.length) {
				var root = [];
				var Add = this._HierarchyObj.HierarchyAdd;
				var Main = this._HierarchyObj.HierarchyMain;
				console.log(Add);
				console.log(Main);
				var Count = this._HierarchyObj.HierarchyMain.length;
				var metadata = {};
				

				this.buildHierarchy(root);
			
			} else {
				var msg = {
					"s":"{i18n>ErrStringsQuantity}"
				};
				console.log("msg -- "+msg.s);
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					msg.s,
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			}
		},
		UpdateLastID: function(lid) {
			this.LastId = lid;
		},
		buildHierarchy: function(root) {
			console.log(root + " Это корень");
			var temp = root;
			/*var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, "Modelbreadcrumbs");*/
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oModel1 = sap.ui.getCore().getModel("plants");
			var oTreeTable = this.getView().byId("treeTableHier").setModel(oJSModel1);
			

			// note that this oData service URL has NavDocs as expand node, treetable has capability
			// to find this node from you service metadata and map it in tree structure, that is the reason below i can simply directly use bindRows to treetable. */
			oModel1.read("/VIEW_HIERARCHY", null, [], true,
				function(oData, oResponse) {
					var data = oData.results;
					console.log(temp);
					var tree = temp;
					var metadata = {};

					console.log(data[0]);

					for (var i = 0; i < data.length; i++) {
						var Node = {};
						Node = data[i];
						Node.Description =  data[i].SHORT_TEXT;
						// переделать генерацию ID 
						Node.ID = data[i].NODE_C.toString();
						Node.ParentNodeID = data[i].PARENT_C;
						Node.Type = data[i].NODE_TYPE;
						Node.LANGUAGE_C = data[i].LANGUAGE_C;
						Node.LONG_TEXT = data[i].LONG_TEXT;
						Node.HIERARCHY_C = data[i].HIERARCHY_C,
						Node.LEVEL = data[i].LEVEL,
						tree.push(Node);
						// this.UpdateLastID(Node.ID);
					}
					
					var flat = {};
					for (var i = 0; i < tree.length; i++) {
						var key = 'id' + tree[i].ID;
						flat[key] = tree[i];
						flat[key].__metadata = "";
					}

					// add child container array to each node
					for (var i in flat) {
						flat[i].children = []; // add children container
					}

					// populate the child container arrays
					for (var i in flat) {
						var parentkey = 'id' + flat[i].ParentNodeID;
						if (flat[parentkey]) {
							flat[parentkey].children.push(flat[i]);
						}
					}

					// find the root nodes (no parent found) and create the hierarchy tree from them
					var root = [];
					for (var i in flat) {
						var parentkey = 'id' + flat[i].ParentNodeID;
						if (!flat[parentkey]) {
							var sum1 = 0;
							var sum2 = 0;
							var sum3 = 0;
							var sum4 = 0;
							var sum5 = 0;
							var sum6 = 0;
							for (var j in flat[i].children) {
								sum1 += +flat[i].children[j].RTO07;
								sum2 += +flat[i].children[j].RTO08;
								sum3 += +flat[i].children[j].REMAINS07;
								sum4 += +flat[i].children[j].REMAINS08;
								sum5 += +flat[i].children[j].SPISANIYA07;
								sum6 += +flat[i].children[j].SPISANIYA08;
							}
							flat[i].RTO07 = parseFloat(sum1).toFixed(2);
							flat[i].RTO08 = parseFloat(sum2).toFixed(2);
							flat[i].REMAINS07 = parseFloat(sum3).toFixed(2);
							flat[i].REMAINS08 = parseFloat(sum4).toFixed(2);
							flat[i].SPISANIYA07 = parseFloat(sum5).toFixed(2);
							flat[i].SPISANIYA08 = parseFloat(sum6).toFixed(2);
							root.push(flat[i]);
						}
					}
					var data = {
						root: root
					};
					console.log("data.root[0]: "+ data.root[0].RTO07);
					oJSModel1.setData(data);
					oTreeTable.setModel(oJSModel1);
					oTreeTable.bindRows({
						path: '/root',
						parameters: {
							countMode: 'Inline',
							treeAnnotationProperties: {
								hierarchyLevelFor: 'HierarchyLevel',
								hierarchyNodeFor: 'ID',
								hierarchyParentNodeFor: 'ParentNodeID',
								hierarchyDrillStateFor: 'DrillState'
							}
						}
					});
					

				},
				function(oError) {
					console.log(oError);
				});
			console.log("LAST");
			console.log(this.LastId);
		},
		
		// build hierarchy for adding shop window
		buildSecondaryHierarchy: function(root) {
			console.log(root + " Это корень");
			var temp = root;
			var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, "Modelbreadcrumbs");
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oModel1 = sap.ui.getCore().getModel("plants");
			if (!this._DialogAddShops) {
				this._DialogAddShops = sap.ui.xmlfragment("AddShops", "com.sap.build.standard.scopeCopy.view.AddShops", this);
			}
			var mainPageTable = sap.ui.core.Fragment.byId("AddShops", "mainPageTable");

			// / *note that this oData service URL has NavDocs as expand node, treetable has capability
			// to find this node from you service metadata and map it in tree structure, that is the reason below i can simply directly use bindRows to treetable. */
			oModel1.read("/VIEW_HIERARCHY", null, [], true,
				function(oData, oResponse) {
					var data = oData.results;
					console.log(temp);
					var tree = temp;
					var metadata = {};

					console.log(data[0]);

					for (var i = 0; i < data.length; i++) {
						var Node = {};
						Node = data[i];
						Node.Description =  data[i].SHORT_TEXT;
						// переделать генерацию ID 
						Node.ID = data[i].NODE_C.toString();
						Node.ParentNodeID = data[i].PARENT_C;
						Node.Type = data[i].NODE_TYPE;
						Node.LANGUAGE_C = data[i].LANGUAGE_C;
						Node.LONG_TEXT = data[i].LONG_TEXT;
						Node.HIERARCHY_C = data[i].HIERARCHY_C,
						Node.LEVEL = data[i].LEVEL;
						if (parseInt(Node.ParentNodeID)===0){
							tree.push(Node);
						}
						// this.UpdateLastID(Node.ID);
					}
					var flat = {};
					for (var i = 0; i < tree.length; i++) {
						var key = 'id' + tree[i].ID;
						flat[key] = tree[i];
						flat[key].__metadata = "";
					}

					// add child container array to each node
					for (var i in flat) {
						flat[i].children = []; // add children container
					}

					// populate the child container arrays
					for (var i in flat) {
						var parentkey = 'id' + flat[i].ParentNodeID;
						if (flat[parentkey]) {
							flat[parentkey].children.push(flat[i]);
						}
					}

					// find the root nodes (no parent found) and create the hierarchy tree from them
					var root = [];
					for (var i in flat) {
						var parentkey = 'id' + flat[i].ParentNodeID;
						if (!flat[parentkey]) {
							var sum1 = 0;
							var sum2 = 0;
							var sum3 = 0;
							var sum4 = 0;
							var sum5 = 0;
							var sum6 = 0;
							for (var j in flat[i].children) {
								sum1 += +flat[i].children[j].RTO07;
								sum2 += +flat[i].children[j].RTO08;
								sum3 += +flat[i].children[j].REMAINS07;
								sum4 += +flat[i].children[j].REMAINS08;
								sum5 += +flat[i].children[j].SPISANIYA07;
								sum6 += +flat[i].children[j].SPISANIYA08;
							}
							flat[i].RTO07 = parseFloat(sum1).toFixed(2);
							flat[i].RTO08 = parseFloat(sum2).toFixed(2);
							flat[i].REMAINS07 = parseFloat(sum3).toFixed(2);
							flat[i].REMAINS08 = parseFloat(sum4).toFixed(2);
							flat[i].SPISANIYA07 = parseFloat(sum5).toFixed(2);
							flat[i].SPISANIYA08 = parseFloat(sum6).toFixed(2);
							root.push(flat[i]);
						}
					}
					var data = {
						root: root
					};
					oJSModel1.setData(data);
				
					// table for dialog window
					mainPageTable.setModel(oJSModel1);
					mainPageTable.bindRows({
						path: '/root',
						parameters: {
							countMode: 'Inline',
							treeAnnotationProperties: {
								hierarchyLevelFor: 'HierarchyLevel',
								hierarchyNodeFor: 'ID',
								hierarchyParentNodeFor: 'ParentNodeID',
								hierarchyDrillStateFor: 'DrillState'
							}
						}
					});

				},
				this._DialogAddShops.open(),
				function(oError) {
					console.log(oError);
				});
			console.log("LAST");
			console.log(this.LastId);
		},
		
		onSavepress: function(e) {
			var oTreeTable = this.byId("treeTableHier");
			var oModel = oTreeTable.getBinding("rows").getModel();
			console.log(oModel.oData);
		},

		_onPageNavButtonPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("PlantsPage", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
		},
		onHandleDataBtnPress: function(oEvent) {
			var dataString = this.getView().byId("handleDataTextArea").mProperties.value;
			var dataGroups = dataString.split("\n");
			var dataItems = [];
			for (var i = 0; i < dataGroups.length; i++) {
				dataItems[i] = dataGroups[i].split(";");
				while (~dataItems[i].indexOf("")) {
					dataItems[i].splice(dataItems[i].indexOf(""), 1);
				}
			}
		},
		_onDeletePress: function(oEvent) {
			var ID = oEvent.getSource().getBindingContext("plants").getObject().ID;

			var OData = this.getOwnerComponent().getModel("plants");
			var oTable = this.getView().byId("userDataTable");

			OData.remove("/USERS(" + ID + ")", null, function() {
					jQuery.sap.require("sap.ui.commons.MessageBox");
					sap.m.MessageBox.show(
						"Пользователь с ID = " + ID + " удален успешно", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Удаление пользователя",
							actions: sap.m.MessageBox.Action.OK
						}
					);
				},
				function(errEvent) {
					jQuery.sap.require("sap.ui.commons.MessageBox");
					sap.m.MessageBox.show(
						"Пользователь с ID = " + ID + " не удален", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Что-то пошло не так",
							actions: sap.m.MessageBox.Action.OK
						}
					);
				});
		}
		/*_onEditePress: function(oEvent) {
			var OData = this.getOwnerComponent().getModel("plants");

			var ID = oEvent.getSource().getBindingContext("plants").getObject().ID;

			var NAME = oEvent.getSource().getBindingContext("plants").getObject().NAME;
			var SURNAME = oEvent.getSource().getBindingContext("plants").getObject().SURNAME;
			var PATRONYMIC = oEvent.getSource().getBindingContext("plants").getObject().PATRONYMIC;
			var ACCESS = oEvent.getSource().getBindingContext("plants").getObject().ACCESS;
			var DATESTART = oEvent.getSource().getBindingContext("plants").getObject().DATESTART;
			var DATEEND = oEvent.getSource().getBindingContext("plants").getObject().DATEEND;

			var that = this;
			var oEntry = {};
			oEntry.NAME = NAME;
			oEntry.SURNAME = SURNAME;
			oEntry.PATRONYMIC = PATRONYMIC;
			oEntry.ACCESS = ACCESS;
			oEntry.DATESTART = DATESTART;
			oEntry.DATEEND = DATEEND;

			var dialog = new sap.m.Dialog({
				title: "Изменить данные",
				type: "Message",
				content: [
					new sap.m.Text({
						text: "Имя "
					}),
					new sap.ui.commons.TextArea({
						width: "100%",
						id: "userNameEdit",
						rows: 1,
						liveChange: function(chEvent) {
							oEntry.NAME = chEvent.getParameter("liveValue");
						}
					}).setValue(NAME),
					new sap.m.Text({
						text: "Фамилия "
					}),
					new sap.ui.commons.TextArea({
						id: "userSernameEdit",
						rows: 1,
						width: "100%",
						liveChange: function(chEvent) {
							oEntry.SURNAME = chEvent.getParameter("liveValue");
						}
					}).setValue(SURNAME),
					new sap.m.Text({
						text: "Отчество "
					}),
					new sap.ui.commons.TextArea({
						id: "userPatronymicEdit",
						rows: 1,
						width: "100%",
						liveChange: function(chEvent) {
							oEntry.PATRONYMIC = chEvent.getParameter("liveValue");
						}
					}).setValue(PATRONYMIC),
					new sap.m.Text({
						text: "Узел иерархии "
					}),
					new sap.ui.commons.TextArea({
						id: "userAccessEdit",
						rows: 1,
						width: "100%",
						liveChange: function(chEvent) {
							oEntry.ACCESS = chEvent.getParameter("liveValue");
						}
					}).setValue(ACCESS),
					new sap.m.Text({
						text: "Дата начала "
					}),
					new sap.ui.commons.TextArea({
						id: "userDatestartEdit",
						rows: 1,
						width: "100%",
						liveChange: function(chEvent) {
							oEntry.DATESTART = chEvent.getParameter("liveValue");
						}
					}).setValue(DATESTART),
					new sap.m.Text({
						text: "Дата конца "
					}),
					new sap.ui.commons.TextArea({
						id: "userDateendEdit",
						rows: 1,
						width: "100%",
						liveChange: function(chEvent) {
							oEntry.DATEEND = chEvent.getParameter("liveValue");
						}
					}).setValue(DATEEND)
				],
				beginButton: new sap.m.Button({
					text: "Подтвердить",
					press: function() {
						MessageToast.show("Submit pressed");

						oEntry.ROLE = "Супервайзер";

						OData.update("/USERS(" + ID + ")", oEntry, null, function() {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.show(
								"Пользователь с ID = " + ID + " изменен успешно", {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Изменение пользователя",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						}, function() {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.show(
								"Пользователь с ID = " + ID + " не изменен", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Что-то пошло не так",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						});
						dialog.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Закрыть",
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		}*/
	});
}, /* bExport= */ true);

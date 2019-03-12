sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../services/DictionaryService",
	"../libs/XLSXlib",
	"sap/ui/table/SortOrder",
	"sap/ui/model/Sorter"
], function(baseController, messageBox, utilities, history, filter, filterOperator, dictionaryService, XLSXjs, sortOrder, sorter) {
	"use strict";
	var table;
	var selectedItem;
	var hierTable;


	var gNode ={};

	// params for _onSearchFieldLiveChange
	var firstEnter = true;
	var initialTable = [];

	return baseController.extend("com.sap.build.standard.scopeCopy.controller.Dictionary", {
		onInit: function() {
			console.log(this.getOwnerComponent());
			selectedItem = "shopDictionary";
			table = this.getView().byId("dictionaryTableData");
			hierTable = this.getView().byId("treeTableHier");
			var buttonToolbar = this.getView().byId("buttonToolbar");
			var checkAdmin = sap.ui.getCore().getModel("userRole").oData.admin;
			if(sap.ui.getCore().getModel("userRole").oData.admin===true){
				dictionaryService.addAdminButtons(this, buttonToolbar);
			}
			// todo: вынести в отдельный метод.

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
			this.getView().addEventDelegate({
				   onBeforeShow: function(evt) {
				   		evt.to.getController().tableBindItems("treeTableHier");
				   		console.log(evt.to);
				   		evt.to.getViewData()(evt.to);
				   }
				});
			// this.tableBindItems("treeTableHier");
			

			/*var oData = sap.ui.getCore().getModel("plants");
			var StructObj = {};
			StructObj.HIERARCHY_C ="1";
			StructObj.NODE_C = "0";
			StructObj.PARENT_C = "";
			StructObj.NODE_TYPE = 0;
			StructObj.LEVEL = "0";
			

			oData.update("/CON(HIERARCHY_C='" + StructObj.HIERARCHY_C + "',NODE_C='" + StructObj.NODE_C + "',NODE_TYPE=" + StructObj.NODE_TYPE +
				")", StructObj, null,
				function() {},
				function() {
					console.log(StructObj);
				});*/

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
			var oModel = this.getView().getModel();
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

		tableBindItems: function(updateTable) {
			/*var oModel = sap.ui.getCore().getModel("plants");*/
			//var oModel = this.getOwnerComponent().getModel("plants");
			//Надо сделать проверку, создавалась ли иерархия, если да, то не создавать ее заново.

			//Building a base hierarchy if no files are uploaded
			var root = [];
			var oModel=this.getView().getModel();
			selectedItem = "shopDictionary";
			table = this.getView().byId("dictionaryTableData");
			hierTable = this.getView().byId("treeTableHier");
			var buttonToolbar = this.getView().byId("buttonToolbar");
			var checkAdmin = sap.ui.getCore().getModel("userRole").oData.admin;
			dictionaryService.getOTable(table, selectedItem, this.pressHandler, checkAdmin,oModel);

			switch (updateTable) {
				case "treeTableHier":
					this.buildHierarchy(root);
					break;
				case "mainPageTable":
					this.buildSecondaryHierarchy(root);
					break;
			}
		},

		// onAfterRendering: function() {
		// 	var this1=this;
		// 	jQuery.sap.delayedCall(100, null, function() {
		// 		var oModel = this1.getView().getModel();
		// 		oModel.updateBindings(true);
		// 	});
		// },
		onLoad: function(e) {
			dictionaryService.Shopimport(e.getParameter("files") && e.getParameter("files")[0], this.getView().byId("dictionaryTableData"));
			this.getView().byId("ShopTable").setVisible(true);
		},
		onPageNavButtonPress: function(oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("PlantsPage", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					messageBox.error(err.message);
				}
			});
		},
		
		/**
		 *  Удаление строки.
		 * 
		 * @param oEvent событие удаления.
		 */
		onDelete: function(oEvent) {
			dictionaryService.deleteCurrentRow(table, selectedItem, this.pressHandler, this.getModel());
		},
		
		
		/**
		 * Переключение таба справочника(выбор другого справочника для отображения)
		 * 
		 * @param oEvent событие переключения.
		 */
		onSelectionChange: function(oEvent) {
			var newSelectedItem = oEvent.getParameters().item.mProperties.key;
			if (newSelectedItem !== selectedItem) {
				selectedItem = newSelectedItem;
			}
			var oModel=this.getView().getModel();
			var checkAdmin = sap.ui.getCore().getModel("userRole").oData.admin;
			if (selectedItem === "hierarchy") {
				var root = [];
				hierTable = this.getView().byId("treeTableHier");
				hierTable.setVisible(true);
				table.setVisible(false);
				this.buildHierarchy(root);
				dictionaryService.getOTable(hierTable, newSelectedItem, this.pressHandler, checkAdmin, oModel);
			} else {
				hierTable.setVisible(false);
				table = this.getView().byId("dictionaryTableData");
				table.setVisible(true);
				dictionaryService.getOTable(table, newSelectedItem, this.pressHandler, checkAdmin, oModel);
			}

		},

		buildHierarchy: function(root) {
			console.log(root + " Это корень");
			var temp = root;
			/*var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, "Modelbreadcrumbs");*/
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			console.log(this);
			var oModel1 = this.getView().getModel();
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
						Node.Description = data[i].SHORT_TEXT;
						// переделать генерацию ID 
						Node.ID = data[i].NODE_C;
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
					console.log("data.root[0]: " + data.root[0].RTO07);
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
		},

		// build hierarchy for adding shop window
		buildSecondaryHierarchy: function(root) {
			console.log(root + " Это корень");
			var temp = root;
			var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, "Modelbreadcrumbs");
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oModel1 = this.getView().getModel();
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
						Node.Description = data[i].SHORT_TEXT;
						// переделать генерацию ID 
						Node.ID = data[i].NODE_C.toString();
						Node.ParentNodeID = data[i].PARENT_C;
						Node.Type = data[i].NODE_TYPE;
						Node.LANGUAGE_C = data[i].LANGUAGE_C;
						Node.LONG_TEXT = data[i].LONG_TEXT;
						Node.HIERARCHY_C = data[i].HIERARCHY_C,
							Node.LEVEL = data[i].LEVEL;
						if (parseInt(Node.ParentNodeID) === 0) {
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
			/*this.OnSaveBtnPress();*/
			this._DialogDeleteNode.close();
		},

		onAddShop: function(oEvent) {
			if (!this._DialogAddShops) {
				this._DialogAddShops = sap.ui.xmlfragment("AddShops", "com.sap.build.standard.scopeCopy.view.AddShops", this);
			}
			/*var mainPageTable = sap.ui.core.Fragment.byId("AddShops", "mainPageTable");*/
			var root = [];
			this.buildSecondaryHierarchy(root);
		},

		onAddShopBtn: function(oEvent) {
			var oData = this.getView().getModel();
			var mainPageTable = sap.ui.core.Fragment.byId("AddShops", "mainPageTable");
			var rowIndex = mainPageTable.getSelectedIndices();
			/*var sPath = mainPageTable.getRows()[rowIndex].getBindingContext();
			var oDataSelect = mainPageTable.getContextByIndex(rowIndex).oModel.getProperty(sPath);*/
			/*var oDataSelect = mainPageTable.getContextByIndex(rowIndex).getBindingContext("plants").getObject();*/

			for (var i = 0; i < rowIndex.length; i++) {
				var index = rowIndex[i];
				var oDataSelect = mainPageTable.getRows()[index].getBindingContext().getObject();
				var newPARENT_C = this.NODE_C;
				var StructObj = {};
				StructObj.HIERARCHY_C = oDataSelect.HIERARCHY_C;
				StructObj.NODE_C = oDataSelect.NODE_C;
				StructObj.PARENT_C = newPARENT_C;
				StructObj.NODE_TYPE = oDataSelect.Type;
				StructObj.LEVEL = oDataSelect.LEVEL;

				oData.update("/CON(HIERARCHY_C='" + StructObj.HIERARCHY_C + "',NODE_C='" + StructObj.NODE_C + "',NODE_TYPE=" + StructObj.NODE_TYPE +
					")", StructObj, null,
					function() {},
					function() {
						console.log(StructObj);
					});
			}
			/*	var oDataSelect = mainPageTable.getRows()[rowIndex].getBindingContext().getObject();
				var newPARENT_C = this.NODE_C;
				var StructObj = {};
				StructObj.HIERARCHY_C =  oDataSelect.HIERARCHY_C;
				StructObj.NODE_C = oDataSelect.NODE_C;
				StructObj.PARENT_C = newPARENT_C;
				StructObj.NODE_TYPE = oDataSelect.Type;
				StructObj.LEVEL = oDataSelect.LEVEL;
				
				oData.update("/CON(HIERARCHY_C='" + StructObj.HIERARCHY_C + "',NODE_C='" + StructObj.NODE_C + "',NODE_TYPE=" + StructObj.NODE_TYPE +
					")", StructObj, null,
					function() {},
					function() {
						console.log(StructObj);
					});*/
			this.tableBindItems("mainPageTable");
			this.tableBindItems("treeTableHier");
			this._DialogAddShops.close();
		},

		onCloseAddShops: function() {
			this.OnSaveBtnPress();
			this._DialogAddShops.close();
		},

		onEditNodeDialog: function() {
			var LONG_TEXT = this.oDataSelect.LONG_TEXT;
			if (!this._DialogEditNode) {
				this._DialogEditNode = sap.ui.xmlfragment("EditNode", "com.sap.build.standard.scopeCopy.view.EditNode", this);
			}
			var oText = sap.ui.core.Fragment.byId("EditNode", "EditLONG_TEXT");
			oText.setValue(LONG_TEXT);
			this._DialogEditNode.open();
		},

		onEditNode: function() {
			var oData = this.getView().getModel();
			gNode.LONG_TEXT = sap.ui.core.Fragment.byId("EditNode", "EditLONG_TEXT").getValue();
			var StructObj = {};
			var InfoObj = {};
			StructObj.HIERARCHY_C = gNode.HIERARCHY_C;
			StructObj.NODE_C = gNode.NODE_C;
			StructObj.PARENT_C = gNode.PARENT_C;
			StructObj.NODE_TYPE = gNode.Type; 
			StructObj.LEVEL = gNode.LEVEL;
			InfoObj.NODE_C = gNode.NODE_C;
			InfoObj.LANGUAGE_C = gNode.LANGUAGE_C;
			InfoObj.SHORT_TEXT = gNode.LONG_TEXT.substring(0, 16);
			InfoObj.LONG_TEXT = gNode.LONG_TEXT;

			oData.update("/CON(HIERARCHY_C='" + StructObj.HIERARCHY_C + "',NODE_C='" + StructObj.NODE_C + "',NODE_TYPE=" + StructObj.NODE_TYPE +
				")", StructObj, null,
				function() {},
				function() {
					console.log(StructObj);
				});
			oData.update("/NUM(NODE_C='" + InfoObj.NODE_C + "',LANGUAGE_C='" + InfoObj.LANGUAGE_C + "')", InfoObj, null, function() {},
				function() {
					console.log(InfoObj);
				});
			this.tableBindItems("treeTableHier");
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
			console.log("sPath: " + sPath);
			var oDataSelect = yourTableObject.getContextByIndex(rowIndex).oModel.getProperty(sPath);
			var Type = oDataSelect.Type;
			var Plant = oDataSelect.NODE_C;
			gNode.SHORT_TEXT = oDataSelect.Description;
			gNode.LONG_TEXT = oDataSelect.LONG_TEXT;

			/*var NODE_C = oDataSelect.NODE_C;
			NODE_C = parseInt(NODE_C);*/
			/*Type = parseInt(Type);*/
			gNode.NODE_C = oDataSelect.NODE_C;
			gNode.Type = Type;
			gNode.PARENT_C = oDataSelect.PARENT_C;
			gNode.LANGUAGE_C = oDataSelect.LANGUAGE_C;
			gNode.HIERARCHY_C = oDataSelect.HIERARCHY_C;
			gNode.LEVEL = oDataSelect.LEVEL;

			this.enableBtn(Type);
			this.oDataSelect = yourTableObject.getContextByIndex(rowIndex).oModel.getProperty(sPath);
			console.log("Plant: " + Plant + " Строка: " + rowIndex + " столбец: " + colIndex + " Type: " + Type + " " + "ParentNodeID " +
				oDataSelect.ParentNodeID +
				" " + oDataSelect + " " + sPath + " " + " this.LONG_TEXT: " + gNode.LONG_TEXT + " oDataSelect.Description: " + oDataSelect.Description
			);
		},

		_onSearchFieldLiveChange: function(oEvent) {

			var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");

			var treeTable = sap.ui.core.Fragment.byId("AddShops", "mainPageTable");
			var aFilters = [];
			if (firstEnter === true) {
				for (var i = 0; i < treeTable.getRows().length; i++) {
					initialTable.push(treeTable.getRows()[i].getCells()[0].getText());
					firstEnter = false;
				}
			}

			if (sQuery && sQuery.length > 0) {
				//path = "/VIEW_COLUMNS_RES?$filter=(substringof('"+sQuery+"',ADDRESS) or substringof('"+sQuery+"',PLANT))";

				var newQuery = sQuery[0].toUpperCase() + sQuery.slice(1);
				var filter = new sap.ui.model.Filter("LONG_TEXT", sap.ui.model.FilterOperator.Contains, sQuery);
				filter.fnTest = function(row) {
					var address = '';
					var id = '';
					for (i = 0; i < initialTable.length; i++) {
						if (row === initialTable[i].toUpperCase()) {
							address = initialTable[i].slice(8);
							for (var j = 0; j < address.length; j++) {
								if (address[j] === ' ') {
									id = address.slice(0, j);
									break;
								}
							}
						}
					}
					var idInRow = false;
					if (id.includes(newQuery) === true) {
						idInRow = true;
						return row;
					}
					if (address.includes(newQuery) === true && isNaN(parseInt(address[address.search(newQuery) - 1])) === true && idInRow === false &&
						isNaN(parseInt(newQuery)) === true) {
						return row;
					}
				};
				aFilters.push(filter);
				//aFilters.push(filter2);
				// update list binding

				var binding = treeTable.getBinding("rows");
				binding.filter(aFilters);
				console.log(treeTable.getBinding("rows"));
			} else {
				this.tableBindItems("tableBindItems");
				this.tableBindItems("mainPageTable");
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

		onGetNewID: function(onMenuAddpress) {

			var oModel = this.getView().getModel();
			var IdArr = [];
			var maxId;
			var type;
			var idNewNode;
			var NODE_C;
			var that = this;
			oModel.read("/CON", null, [], true,
				function(oData, oResponse) {
					var data = oData.results;

					console.log(data[0]);

					for (var i = 0; i < data.length; i++) {
						type = Number(data[i].NODE_TYPE);
						if (type !== 2) {
							NODE_C = Number(data[i].NODE_C);
							console.log(NODE_C);
							IdArr.push(NODE_C);
						}
					}
					console.log(IdArr[0]);
					maxId = Math.max.apply(null, IdArr);
					console.log(maxId);
					idNewNode = maxId + 1;
					idNewNode = Number(idNewNode);
					console.log(idNewNode);
					/*return idNewNode;*/

					onMenuAddpress(that, idNewNode);
				});

			console.log("idNewNode: " + idNewNode);

		},

		onAddingFolder: function() {
			this.onGetNewID(this.onMenuAddpress);
		},
		
		onMenuAddpress: function(that, idNewNode) {
			/*	var oDragSession = oEvent.getParameter("dragSession");*/
			console.log("Выполняюсь после onGetNewID");
			console.log("aIdNewNode: " + idNewNode);
			var Name = sap.ui.core.Fragment.byId("AddFolder", "AddFolderName").getValue();
			sap.ui.core.Fragment.byId("AddFolder", "AddFolderName").setValue("");
			console.log("Name: " + Name);
			var oTreeTable = hierTable;
			idNewNode = String(idNewNode);
			console.log(idNewNode);
			// verification adding new node
			// type = 2, if shop node
			// type !=2 another situations
			//idNewNode = oContext.getProperty("Type")
			try {
				var oData = this.getView().getModel();
				var StructObj = {};
				var InfoObj = {};
				var parent = gNode.NODE_C;
				console.log(typeof aIdNewNode);
				StructObj.HIERARCHY_C = gNode.HIERARCHY_C;
				StructObj.NODE_C = idNewNode;
				StructObj.PARENT_C = parent;
				StructObj.NODE_TYPE = "1";
				StructObj.LEVEL = gNode.LEVEL;
				InfoObj.NODE_C = idNewNode;
				InfoObj.LANGUAGE_C = gNode.LANGUAGE_C;
				InfoObj.SHORT_TEXT = Name.substring(0, 16);
				InfoObj.LONG_TEXT = Name;
				console.log(StructObj);
				console.log(InfoObj);
				oData.create("/CON", StructObj, null,
					function() {},
					function() {
						console.log(StructObj);
					});
				oData.create("/NUM", InfoObj, null, function() {},
					function() {
						console.log(InfoObj);
					});

			} catch (err) {

				console.log("CATCH");
				var oData = this.getView().getModel();
				var StructObj = {};
				var InfoObj = {};
				var parent = gNode.NODE_C;
				StructObj.HIERARCHY_C = gNode.HIERARCHY_C;
				StructObj.NODE_C = idNewNode;
				StructObj.PARENT_C = "null";
				StructObj.NODE_TYPE = "1";
				StructObj.LEVEL = gNode.LEVEL;
				InfoObj.NODE_C = idNewNode;
				InfoObj.LANGUAGE_C = gNode.LANGUAGE_C;
				InfoObj.SHORT_TEXT = Name.substring(0, 16);
				InfoObj.LONG_TEXT = Name;

				oData.create("/CON", StructObj, null,
					function() {},
					function() {
						console.log(StructObj);
					});
				oData.create("/NUM", InfoObj, null, function() {},
					function() {
						console.log(InfoObj);
					});

			}
			
			
			that.tableBindItems("treeTableHier");
			that._DialogAddFolder.close();

		},
		
		onMenuDeletepress: function(oEvent) {
			/*var p=oEvent.getSource().oParent.oParent.oBindingContexts.undefined.sPath;*/
			/*	var oTreeTable = this.byId("treeTableHier");
				var aSelectedIndices = this.selectedTreeTableItem;
				var oModel = oTreeTable.getBinding("rows").getModel();*/

			// Cut the data.
			/*var oContext = oTreeTable.getContextByIndex(aSelectedIndices);
			var oData = oContext.getProperty();*/

			var oData = this.getView().getModel();
			var StructObj = {};
			StructObj.HIERARCHY_C = gNode.HIERARCHY_C;
			StructObj.NODE_C = gNode.NODE_C;
			StructObj.PARENT_C = "0";
			StructObj.NODE_TYPE = gNode.Type;
			StructObj.LEVEL = gNode.LEVEL;
			oData.update("/CON(HIERARCHY_C='" + StructObj.HIERARCHY_C + "',NODE_C='" + StructObj.NODE_C + "',NODE_TYPE=" + StructObj.NODE_TYPE +
				")", StructObj, null,
				function() {},
				function() {
					console.log(StructObj);
				});

			/*	if (oData) {
					// this._aClipboardData.push(oContext.getProperty());

					// The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
					oModel.setProperty(oContext.getPath(), undefined, oContext, true);
				}*/
			this.tableBindItems("treeTableHier");
			this._DialogDeleteNode.close();
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
				var msg = new sap.m.Text({
					text: "{i18n>NoFileSelected}"
				});

				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					msg,
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			} else if ((this.getView().byId(input).mProperties.value).split(".")[1] !== "csv") {
				var msg = new sap.m.Text({
					text: "{i18n>SuccesHierMsg}"
				});

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
			var msg = new sap.m.Text({
				text: "{i18n>SuccesHierMsg}"
			});
			sap.m.MessageBox.show(msg, {
				actions: [sap.m.MessageBox.Action.YES],
				duration: 3000,
				animationDuration: 2000
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

				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					"Видимо, вы не выбрали файл для загрузки",
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			} else if ((this.getView().byId(input).mProperties.value).split(".")[1] !== "csv") {

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
			console.log("HierarchyAdd " + strCSV);
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
					"s": "{i18n>ErrStringsQuantity}"
				};
				console.log("msg -- " + msg.s);

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

		//Добавление строки при клике.
		onAdd: function(oEvent) {
			dictionaryService.addRow(table, selectedItem, this.pressHandler, this.getModel());
		},
		// Редактирование строки при клике.
		pressHandler: function(oEvent) {
			// var selectedRow = this.getBindingContext();
			dictionaryService.editRow(table, selectedItem, oEvent.getSource().getBindingContext().getObject(), this.getModel());
		},
		
		onSearchFieldLiveChange: function(oEvent) {
			var valueSearch = oEvent.getParameter("query") || oEvent.getParameter("newValue");
			var oModel=this.getView().getModel();
			var checkAdmin = sap.ui.getCore().getModel("userRole").oData.admin;
			if (valueSearch) {
				dictionaryService.getOTable(table, selectedItem, this.pressHandler, checkAdmin, oModel, valueSearch);
			} else if (valueSearch === "") {
				dictionaryService.getOTable(table, selectedItem, this.pressHandler, checkAdmin, oModel);
			}
		}
	});

});
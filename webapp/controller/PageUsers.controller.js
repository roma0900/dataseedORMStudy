sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/table/SortOrder",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	/*"sap/ui/onlinesales/webapp/model/formatter"*/
	"../model/formatter"
], function(BaseController, SortOrder, MessageBox, Utilities, History, Filter, MessageToast, Sorter, formatter) {
	"use strict";
	return BaseController.extend("com.sap.build.standard.scopeCopy.controller.PageUsers", {
		
		onInit: function() {
			this.newUserHierarchyLevel = "";

			var oModel = sap.ui.getCore().getModel("plants");
			var oTable = this.getView().byId("userDataTable").setModel(oModel);
			
	    	oTable.bindRows("plants>/VIEW_USERS");
	    	oTable.setSelectedIndex(0);
	    	
			function addColumnSorterAndFilter(oColumn, comparator) {
				var oTable = oColumn.getParent();
				var oCustomMenu = new sap.ui.commons.Menu();
				
				oCustomMenu.addItem(new sap.ui.commons.MenuItem({
					text: "Сортировка по восходящей",
					icon: "sap-icon://sort-ascending",
					select:function() {
						var oSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), false);
						oSorter.fnCompare = comparator;
						oTable.getBinding("rows").sort(oSorter);
						
						for (var i = 0; i < oTable.getColumns().length; i++){ oTable.getColumns()[i].setSorted(false);}                
						oColumn.setSorted(true);
						oColumn.setSortOrder(sap.ui.table.SortOrder.Ascending);
					}
				}));
				oCustomMenu.addItem(new sap.ui.commons.MenuItem({
					text: "Сортировка по нисходящей",
					icon: "sap-icon://sort-descending",
					select:function(oControlEvent) {
					     var oSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), true);
					     oSorter.fnCompare=comparator;
					     oTable.getBinding("rows").sort(oSorter);
					        
					     for (var i=0;i<oTable.getColumns().length; i++) {oTable.getColumns()[i].setSorted(false);}
					    
					     oColumn.setSorted(true);
					     oColumn.setSortOrder(sap.ui.table.SortOrder.Descending);
					}
				}));
				
				oColumn.setMenu(oCustomMenu);
				return oColumn;
			}
			function compareIntegers(value1, value2) {
				if ((value1 == null || value1 === undefined || value1 === "") && (value2 == null || value2 === undefined || value2 === "")) 
				{return 0;}
				if ((value1 == null || value1 === undefined || value1 === "")) 
				{return -1;}
				if ((value2 == null || value2 === undefined || value2 === "")) {return 1;}
				if(value1 < value2) {return -1;}
				if(value1 === value2) {return 0;}
				if(value1 > value2) {return 1; }          
			}
			var oColumn = this.getView().byId("nspValue");
			addColumnSorterAndFilter(oColumn, compareIntegers);
		},
		onAfterRendering: function(){
			jQuery.sap.delayedCall(100,null,function(){
				var oModel = sap.ui.getCore().getModel("plants");
				oModel.updateBindings(true);
			});
		},
		_onEditDelete: function(eObject){
			var oEntry = {};
			var oData = sap.ui.getCore().getModel("plants");
			
			oEntry.ID = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserID").getValue();
			oEntry.NAME = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserName").getValue();
			oEntry.SURNAME = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserSurname").getValue();
			oEntry.PATRONYMIC = sap.ui.core.Fragment.byId("EditUserFragment", "AdEditUserPatronymic").getValue();
			oEntry.ACCESS = sap.ui.core.Fragment.byId("EditUserFragment", "InputForHierarchyId").getValue();
			oEntry.DATESTART = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserStartDate").getValue();
			oEntry.DATEEND = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserEndDate").getValue();
			oEntry.ROLE = "Супервайзер";
			//oEntry.STATUS = "Удален";
			//var ID = eObject.ID;
			if(sap.ui.core.Fragment.byId("EditUserFragment", "EditUserSTATUS").getValue() === "Удален"){
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.m.MessageBox.show(
					"Пользователь уже удален", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Удаление пользователя",
						actions: sap.m.MessageBox.Action.OK
					}
				);
				return;
			}
			var OData = sap.ui.getCore().getModel("plants");
			var that = this;
			
			var dialogUserEndDate = new sap.m.Dialog({
				title: "Дата увольнения пользователя",
				type: "Message",
				content: [
					new sap.m.Label({ text: "Дата конца" }),
					new sap.m.DatePicker({
						width: "100%", 
						id: "userDateendCreate",
						value: (new Date()).getDate() + "." + ((new Date()).getMonth() + +1) + "." + (new Date()).getFullYear(),
						type: "Date",
						placeholder: "{i18n>EnterCloseDate}",
						change: function(chEvent){
							oEntry.DATEEND = chEvent.getParameter("value");
						}
					})
				],
				beginButton: new sap.m.Button({
					text: "Выбрать",
					press: function () {
						if(oEntry.DATEEND === "" || oEntry.DATEEND === undefined || oEntry.DATEEND === " "){
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.show(
								"Видимо, вы заполнили не все поля необходимые для добавления нового пользователя", 
								{
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Упс, что-то пошло не так",
									actions: sap.m.MessageBox.Action.OK
								}
							);
							return;
						}
						oEntry.STATUS = "Удален";
						
						//$.when(function(){
							OData.update("/USERS(" + oEntry.ID + ")", oEntry, null, function(){
								jQuery.sap.require("sap.ui.commons.MessageBox");
								sap.m.MessageBox.show(
									"Пользователь удален успешно", {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "Удаление пользователя",
										actions: sap.m.MessageBox.Action.OK
									}
								);
								that._DialogEditUser.close();
								}, function(){
								jQuery.sap.require("sap.ui.commons.MessageBox");
								sap.m.MessageBox.show(
									"Пользователь с ID = " + oEntry.ID + " не удален", {
										icon: sap.m.MessageBox.Icon.WARNING,
										title: "Что-то пошло не так",
										actions: sap.m.MessageBox.Action.OK
									}
								);
							});
						
						dialogUserEndDate.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Закрыть",
					press: function () {
						dialogUserEndDate.close();
					}
				}),
				afterClose: function() {
					dialogUserEndDate.destroy();
				}
			});
			dialogUserEndDate.open();
			
			// OData.update("/USERS(" + oEntry.ID + ")", oEntry, null, function(){
			// 	jQuery.sap.require("sap.ui.commons.MessageBox");
			// 	sap.m.MessageBox.show(
			// 		"Пользователь удален успешно", {
			// 			icon: sap.m.MessageBox.Icon.SUCCESS,
			// 			title: "Удаление пользователя",
			// 			actions: sap.m.MessageBox.Action.OK
			// 		}
			// 	);
			// 	that._DialogEditUser.close();
			// }, function(){
			// 	jQuery.sap.require("sap.ui.commons.MessageBox");
			// 	sap.m.MessageBox.show(
			// 		"Пользователь с ID = " + oEntry.ID + " не удален", {
			// 			icon: sap.m.MessageBox.Icon.WARNING,
			// 			title: "Что-то пошло не так",
			// 			actions: sap.m.MessageBox.Action.OK
			// 		}
			// 	);
			// });
		},
		_onDelete: function(eObject){
			var ID = this.getView().byId("userDataTable").getSelectedIndex();
			if(ID === -1){
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.m.MessageBox.show(
					"Не выбран ни один пользователь", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Удаление пользователя",
						actions: sap.m.MessageBox.Action.OK
					}
				);
				return;
			}
			if(this.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().STATUS === "Удален"){
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.m.MessageBox.show(
					"Пользователь уже удален", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Удаление пользователя",
						actions: sap.m.MessageBox.Action.OK
					}
				);
				return;
			}
			var OData = sap.ui.getCore().getModel("plants");
			var that = this;
			var oEntry = {};
			oEntry.DATEEND = (new Date()).getDate() + "." + ((new Date()).getMonth() + +1) + "." + (new Date()).getFullYear();
			
			var dialogUserEndDate = new sap.m.Dialog({
				title: "Дата увольнения пользователя",
				type: "Message",
				content: [
					new sap.m.Label({ text: "Дата конца" }),
					new sap.m.DatePicker({
						width: "100%", 
						id: "userDateendCreate",
						value: (new Date()).getDate() + "." + ((new Date()).getMonth() + +1) + "." + (new Date()).getFullYear(),
						type: "Date",
						placeholder: "{i18n>EnterCloseDate}",
						change: function(chEvent){
							oEntry.DATEEND = chEvent.getParameter("value");
						}
					})
				],
				beginButton: new sap.m.Button({
					text: "Выбрать",
					press: function () {
						if(oEntry.DATEEND === "" || oEntry.DATEEND === undefined || oEntry.DATEEND === " "){
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.show(
								"Видимо, вы заполнили не все поля необходимые для добавления нового пользователя", 
								{
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Упс, что-то пошло не так",
									actions: sap.m.MessageBox.Action.OK
								}
							);
							return;
						}
						
						oEntry.ID = that.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().ID;	
						oEntry.NAME = that.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().NAME;
						oEntry.SURNAME = that.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().SURNAME;
						oEntry.PATRONYMIC = that.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().PATRONYMIC;
						oEntry.ACCESS = that.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().ACCESS;
						oEntry.DATESTART = that.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().DATESTART;
						oEntry.ROLE = "Супервайзер";
						oEntry.STATUS = "Удален";
						
						//$.when(function(){
							OData.update("/USERS(" + that.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().ID + ")", oEntry, null, function(){
								jQuery.sap.require("sap.ui.commons.MessageBox");
								sap.m.MessageBox.show(
									"Пользователь удален успешно", {
										icon: sap.m.MessageBox.Icon.SUCCESS,
										title: "Удаление пользователя",
										actions: sap.m.MessageBox.Action.OK
									}
								);
							}, function(){
								jQuery.sap.require("sap.ui.commons.MessageBox");
								sap.m.MessageBox.show(
									"Пользователь с ID = " + ID + " не удален", {
										icon: sap.m.MessageBox.Icon.WARNING,
										title: "Что-то пошло не так",
										actions: sap.m.MessageBox.Action.OK
									}
								);
							});
						
						dialogUserEndDate.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Закрыть",
					press: function () {
						dialogUserEndDate.close();
					}
				}),
				afterClose: function() {
					dialogUserEndDate.destroy();
				}
			});
			dialogUserEndDate.open();
			
				//#region FullDelete
			// 	OData.remove("/USERS(" + that.getView().byId("userDataTable").getRows()[ID].getBindingContext("plants").getObject().ID + ")", null, function(){
			// 	jQuery.sap.require("sap.ui.commons.MessageBox");
			// 	sap.m.MessageBox.show(
			// 		"Пользователь удален успешно", {
			// 			icon: sap.m.MessageBox.Icon.SUCCESS,
			// 			title: "Удаление пользователя",
			// 			actions: sap.m.MessageBox.Action.OK
			// 		}
			// 	);
			// }, function(){
			// 	jQuery.sap.require("sap.ui.commons.MessageBox");
			// 	sap.m.MessageBox.show(
			// 		"Пользователь с ID = " + ID + " не удален", {
			// 			icon: sap.m.MessageBox.Icon.SUCCESS,
			// 			title: "Что-то пошло не так",
			// 			actions: sap.m.MessageBox.Action.OK
			// 		}
			// 	);
			// });
			//#endregion FullDelete
			//}).done();
			
		},
		_onPageNavButtonPress: function(oEvent){
			var oBindingContext = oEvent.getSource().getBindingContext();
	
			return new Promise(function(fnResolve) {
	
				this.doNavigate("PlantsPage", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		handleValueHelp: function(){
			if (!this._DialogUserHierarchy) {
				this._DialogUserHierarchy = sap.ui.xmlfragment("userHierarchyFragment","com.sap.build.standard.scopeCopy.view.AddUserHierarchyFragment", this);
			}
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oModel1 = sap.ui.getCore().getModel("plants");
			var oTreeTable = sap.ui.core.Fragment.byId("userHierarchyFragment", "UserHierarchyTree").setModel(oJSModel1);
			var tree = [];
			oModel1.read("/VIEW_HIERARCHY", null, [], true, 
				function(oData, oResponse) {
					var data = oData.results;
					var metadata = {};
					
					for(var i = 0; i < data.length; i++){
						var Node = {};
						//Node = data[i];
						Node.Description = data[i].LONG_TEXT;
						Node.ID = data[i].NODE_C;
						Node.ParentNodeID = data[i].PARENT_C;
						Node.Type = data[i].NODE_TYPE;
						Node.__metadata = metadata;
						tree.push(Node);
					}
					
					var root = [];
					for(var i = 0; i < tree.length; i++){
						if(tree[i].ParentNodeID === "null"){
							root.push(tree[i]);
						}
					}
					
					var flat = {};
		            for (var i = 0; i < tree.length; i++) {
		                var key = "id" + tree[i].ID;
		                flat[key] = tree[i];
		                flat[key].__metadata = "";
		            }
		
		            // add child container array to each node
		            for (var i in flat) {
		                flat[i].children = []; // add children container
		            }
		            // populate the child container arrays
		            for (var i in flat) {
		                var parentkey = "id" + flat[i].ParentNodeID;
		                if (flat[parentkey]) {
		                    flat[parentkey].children.push(flat[i]);
		                }
		            }
		            // find the root nodes (no parent found) and create the hierarchy tree from them
		            // here it is!          
		            // console.log(root);    
		            // to access the JSON via "/root" in bindRows(), could this be a problem?? 
					var data = {
					    root: root
					};
		
		            console.log(data);
					oJSModel1.setData(data);
					oTreeTable.setModel(oJSModel1);
					oTreeTable.bindRows({
						path : '/root',
						parameters : {
							countMode: "Inline",
							treeAnnotationProperties : {
								hierarchyLevelFor : "HierarchyLevel",
								hierarchyNodeFor : "ID",
								hierarchyParentNodeFor : "ParentNodeID",
								hierarchyDrillStateFor : "DrillState"
							}
						}
					}); 
				},
					function(oError) { console.log(oError); } 
			);
			// oTreeTable.attachRowSelect(function(oEvent){
			// 	var currentRowContext = oEvent.getParameter("rowContext"); 
			// 	sap.ui.core.Fragment.byId("userHierarchyFragment", "InputForHierarchyId").setValue();
			// });
            this._DialogUserHierarchy.open();
            
		},
		rowSelectionChange:	function(oEvent){
			sap.ui.core.Fragment.byId("userHierarchyFragment", "InputForHierarchyId").setValue(oEvent.getParameter("rowContext").getObject().ID);
			sap.ui.core.Fragment.byId("userHierarchyFragment", "InputForHierarchyDesc").setValue(oEvent.getParameter("rowContext").getObject().Description);
		},
		onCloseUserHierarchyDialogConfirm: function(){
			if(sap.ui.core.Fragment.byId("addUserFragment", "InputForHierarchyId") !== undefined){
				sap.ui.core.Fragment.byId("addUserFragment", "InputForHierarchyId").setValue(sap.ui.core.Fragment.byId("userHierarchyFragment", "InputForHierarchyId").getValue());
				sap.ui.core.Fragment.byId("addUserFragment", "InputForHierarchy").setValue(sap.ui.core.Fragment.byId("userHierarchyFragment", "InputForHierarchyDesc").getValue());
			}
			if(sap.ui.core.Fragment.byId("EditUserFragment", "InputForHierarchyId") !== undefined){
				sap.ui.core.Fragment.byId("EditUserFragment", "InputForHierarchyId").setValue(sap.ui.core.Fragment.byId("userHierarchyFragment", "InputForHierarchyId").getValue());
				sap.ui.core.Fragment.byId("EditUserFragment", "InputForHierarchy").setValue(sap.ui.core.Fragment.byId("userHierarchyFragment", "InputForHierarchyDesc").getValue());
			}
			this._DialogUserHierarchy.close();
		},
		onCloseUserHierarchyDialogCancel: function(){
			this._DialogUserHierarchy.close();
		},
		_onAdd: function(oEvent){
			if (!this._DialogAddUser) {
				this._DialogAddUser = sap.ui.xmlfragment("addUserFragment","com.sap.build.standard.scopeCopy.view.AddUserFragment", this);
			}
			/*#region Hierarchy tree*/
			sap.ui.core.Fragment.byId("addUserFragment", "InputForHierarchy")._getValueHelpIcon().setSrc("sap-icon://feeder-arrow");
			sap.ui.core.Fragment.byId("addUserFragment", "AddUserStartDate").setValue((new Date()).getDate() + "." + ((new Date()).getMonth() + +1) + "." + (new Date()).getFullYear());
			sap.ui.core.Fragment.byId("addUserFragment", "AddUserStartDate").setMinDate(new Date());
			sap.ui.core.Fragment.byId("addUserFragment", "AddUserEndDate").setMinDate(new Date());
			
			/*#endregion*/
            this._DialogAddUser.open();
		},
		_onAddUserStartDateValueChange: function(oEvent){
			sap.ui.core.Fragment.byId("addUserFragment", "AddUserEndDate").setMinDate(oEvent.getSource().getDateValue());
		},
		onCloseUserAddingDialogConfirm: function(){
			var oEntry = {};
			oEntry.ID = "10";
			oEntry.NAME = sap.ui.core.Fragment.byId("addUserFragment", "AddUserName").getValue();
			oEntry.SURNAME = sap.ui.core.Fragment.byId("addUserFragment", "AddUserSurname").getValue();
			oEntry.PATRONYMIC = sap.ui.core.Fragment.byId("addUserFragment", "AddUserPatronymic").getValue();
			oEntry.DATESTART = sap.ui.core.Fragment.byId("addUserFragment", "AddUserStartDate").getValue();
			oEntry.DATEEND = sap.ui.core.Fragment.byId("addUserFragment", "AddUserEndDate").getValue();
			oEntry.ROLE = "Супервайзер";
			oEntry.ACCESS = sap.ui.core.Fragment.byId("addUserFragment", "InputForHierarchyId").getValue();
			oEntry.STATUS = "Активен";
			oEntry.GREEN_LVL = "100";
			oEntry.YELLOW_LVL = "80";
			
			if(oEntry.DATESTART === undefined || oEntry.DATESTART === ""){
				oEntry.DATESTART = (new Date()).getDate() + "." + (new Date()).getMonth()+1 + "." + (new Date()).getFullYear();
			}
			if(oEntry.NAME === "" || oEntry.SURNAME === "" || oEntry.DATESTART === "" || oEntry.DATEEND === " "){
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.m.MessageBox.show(
					"Видимо, вы заполнили не все поля необходимые для добавления нового пользователя", 
					{
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Упс, что-то пошло не так",
						actions: sap.m.MessageBox.Action.OK
					}
				);
				return;
			}
			this.backRequest(oEntry);
			
			this.getView().byId("userDataTable").getBinding("rows").refresh();
			
			this._DialogAddUser.close();
		},
		onCloseUserAddingDialogCancel: function(){
			this._DialogAddUser.close();
		},
		_onEditePress: function(oEvent){
			if (!this._DialogEditUser) {
				this._DialogEditUser = sap.ui.xmlfragment("EditUserFragment","com.sap.build.standard.scopeCopy.view.EditUserFragment", this);
			}
			
			sap.ui.core.Fragment.byId("EditUserFragment", "InputForHierarchy")._getValueHelpIcon().setSrc("sap-icon://feeder-arrow");
			
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserStartDate").setMinDate(new Date());
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserEndDate").setMinDate(new Date());
			
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserID").setValue(oEvent.getSource().getBindingContext("plants").getObject().ID);
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserName").setValue(oEvent.getSource().getBindingContext("plants").getObject().NAME);
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserSurname").setValue(oEvent.getSource().getBindingContext("plants").getObject().SURNAME);
			sap.ui.core.Fragment.byId("EditUserFragment", "AdEditUserPatronymic").setValue(oEvent.getSource().getBindingContext("plants").getObject().PATRONYMIC);
			sap.ui.core.Fragment.byId("EditUserFragment", "InputForHierarchy").setValue(oEvent.getSource().getBindingContext("plants").getObject().SHORT_TEXT);
			sap.ui.core.Fragment.byId("EditUserFragment", "InputForHierarchyId").setValue(oEvent.getSource().getBindingContext("plants").getObject().ACCESS);
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserStartDate").setValue(oEvent.getSource().getBindingContext("plants").getObject().DATESTART);
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserEndDate").setValue(oEvent.getSource().getBindingContext("plants").getObject().DATEEND);
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserSTATUS").setValue(oEvent.getSource().getBindingContext("plants").getObject().STATUS);
			
			this._DialogEditUser.open();
		},
		_onEditUserStartDateValueChange: function(oEvent){
			sap.ui.core.Fragment.byId("EditUserFragment", "EditUserEndDate").setMinDate(oEvent.getSource().getDateValue());
		},
		onCloseUserEditDialogCancel: function(){
			this._DialogEditUser.close();
		},
		onCloseUserEditDialogConfirm: function(){
			var oEntry = {};
			var oData = sap.ui.getCore().getModel("plants");
			
			oEntry.ID = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserID").getValue();
			oEntry.NAME = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserName").getValue();
			oEntry.SURNAME = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserSurname").getValue();
			oEntry.PATRONYMIC = sap.ui.core.Fragment.byId("EditUserFragment", "AdEditUserPatronymic").getValue();
			oEntry.ACCESS = sap.ui.core.Fragment.byId("EditUserFragment", "InputForHierarchyId").getValue();
			oEntry.DATESTART = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserStartDate").getValue();
			oEntry.DATEEND = sap.ui.core.Fragment.byId("EditUserFragment", "EditUserEndDate").getValue();
			oEntry.ROLE = "Супервайзер";
			oEntry.STATUS = "Активен";
			oEntry.GREEN_LVL = "100";
			oEntry.YELLOW_LVL = "80";
			
			oData.read("USERS?$filter=ID eq " + oEntry.ID, null, [], true, 
				function(tData) {
					oEntry.GREEN_LVL = (tData.results[0].GREEN_LVL === null)?("100"):(tData.results[0].GREEN_LVL);
					oEntry.YELLOW_LVL = (tData.results[0].YELLOW_LVL === null)?("80"):(tData.results[0].YELLOW_LVL);
				},
				function(){
					jQuery.sap.require("sap.ui.commons.MessageBox");
					sap.m.MessageBox.show(
						"Пользователь с ID = " + oEntry.ID + " не изменен", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Что-то пошло не так",
							actions: sap.m.MessageBox.Action.OK
						}
					);
					return;
				}
			);
							
			oData.update("/USERS(" + oEntry.ID + ")", oEntry, null, function(){
					jQuery.sap.require("sap.ui.commons.MessageBox");
					sap.m.MessageBox.show(
						"Пользователь с ID = " + oEntry.ID + " изменен успешно", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Изменение пользователя",
							actions: sap.m.MessageBox.Action.OK
						}
					);
			 	},function(){
					jQuery.sap.require("sap.ui.commons.MessageBox");
					sap.m.MessageBox.show(
						"Пользователь с ID = " + oEntry.ID + " не изменен", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Что-то пошло не так",
							actions: sap.m.MessageBox.Action.OK
						}
					);
			 	});
			this._DialogEditUser.close();
			this.tableBindItems("plants>/VIEW_USERS");
		},
		backRequest:function(tempData){
			var OData = sap.ui.getCore().getModel("plants");
			//var OData = this.getOwnerComponent().getModel("plants");
			
			OData.create("/USERS", tempData, null, function(){
				console.log("The data of user was added to odata service");
			},
			function(){
				console.log("some errors of adding new user");
			},null,
			{headers: {"Access-Control-Allow-Origin": "*"}});
		},
		_onSort: function(){
			if (!this._DialogSort) {
				this._DialogSort = sap.ui.xmlfragment("com.sap.build.standard.scopeCopy.view.UserSortFragment", this);
			}
            this._DialogSort.open();
		},
		handleConfirmUserSort: function(oEvent){
			var oView = this.getView();
			var oTable = oView.byId("userDataTable");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("rows");

			var sPath;
			var bDescending;
			var aSorters = [];
			
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},
		_onFilter: function() {
			if (!this._DialogFilter) {
				this._DialogFilter = sap.ui.xmlfragment("filterFragment","com.sap.build.standard.scopeCopy.view.UserFilterFragment", this);
			}
			
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oModel1 = sap.ui.getCore().getModel("plants");
			var oTreeTable = sap.ui.core.Fragment.byId("filterFragment", "UserHierarchyTree").setModel(oJSModel1);
			var tree = [];
			oModel1.read("/VIEW_HIERARCHY", null, [], true, 
				function(oData, oResponse) {
					var data = oData.results;
					var metadata = {};
					
					for(var i = 0; i < data.length; i++){
						var Node = {};
						//Node = data[i];
						Node.Description = data[i].LONG_TEXT;
						Node.ID = data[i].NODE_C;
						Node.ParentNodeID = data[i].PARENT_C;
						Node.Type = data[i].NODE_TYPE;
						Node.__metadata = metadata;
						tree.push(Node);
					}
					
					var root = [];
					for(var i = 0; i < tree.length; i++){
						if(tree[i].ParentNodeID === "null"){
							root.push(tree[i]);
						}
					}
					
					var flat = {};
		            for (var i = 0; i < tree.length; i++) {
		                var key = "id" + tree[i].ID;
		                flat[key] = tree[i];
		                flat[key].__metadata = "";
		            }
		
		            // add child container array to each node
		            for (var i in flat) {
		                flat[i].children = []; // add children container
		            }
		            // populate the child container arrays
		            for (var i in flat) {
		                var parentkey = "id" + flat[i].ParentNodeID;
		                if (flat[parentkey]) {
		                    flat[parentkey].children.push(flat[i]);
		                }
		            }
		            // find the root nodes (no parent found) and create the hierarchy tree from them
		            // here it is!          
		            // console.log(root);    
		            // to access the JSON via "/root" in bindRows(), could this be a problem?? 
					var data = {
					    root: root
					};
		
		            console.log(data);
					oJSModel1.setData(data);
					oTreeTable.setModel(oJSModel1);
					oTreeTable.bindRows({
						path : '/root',
						parameters : {
							countMode: "Inline",
							treeAnnotationProperties : {
								hierarchyLevelFor : "HierarchyLevel",
								hierarchyNodeFor : "ID",
								hierarchyParentNodeFor : "ParentNodeID",
								hierarchyDrillStateFor : "DrillState"
							}
						}
					}); 
				},
					function(oError) { console.log(oError); } 
			);
			oTreeTable.attachSelect(function(oEvent){
				for(var i = 0; i < tree.length; i++){
					if(tree[i].Description === oEvent.getSource().getSelectedItem().mProperties.title){
						this.newUserHierarchyLevel = tree[i];
						sap.ui.core.Fragment.byId("filterFragment", "HierarchyFilter").setValue(this.newUserHierarchyLevel.Description);
						return;
					}
				}
			});
			
            this._DialogFilter.open();
		},
		onFilterFragmentReset: function(){
			var tPath = "plants>/VIEW_USERS";
			this.tableBindItems(tPath);
		},
		handleConfirmUserFilter: function(){
			var vValueHL = sap.ui.core.Fragment.byId("filterFragment", "HierarchyFilter").getValue();
			//var vValueGT = sap.ui.core.Fragment.byId("filterFragment", "vValueGT").getValue();
			if(sap.ui.core.Fragment.byId("filterFragment", "vValueRole").getSelectedItem() !== null){
				var vValueRole = sap.ui.core.Fragment.byId("filterFragment", "vValueRole").getSelectedItem().getText();
			}
			
			if(sap.ui.core.Fragment.byId("filterFragment", "vValueStatus").getSelectedItem() !== null){
				var vValueStatus = sap.ui.core.Fragment.byId("filterFragment", "vValueStatus").getSelectedItem().getText() || "";
			}
			var tPath = "plants>/VIEW_USERS?$filter=(ID ge " + 1;
			//var vCase;
			
			if(vValueStatus !== "" && vValueStatus !== null && vValueStatus !== undefined && vValueStatus !== "Все")
			{
				tPath += " and STATUS eq '" + vValueStatus + "'";
			}
			if(vValueRole !== "" && vValueRole !== null && vValueRole !== undefined)
			{
				tPath += " and ROLE eq '" + vValueRole + "'";
			}
			if(vValueHL !== "" && vValueHL !== null && vValueHL !== undefined)
			{
				tPath += " and ACCESS eq '" + vValueHL + "'";
			}
			// if(vValueLT !== "" && vValueGT !== ""){
			// 		vCase = 1;
			// } else if(vValueLT === "" && vValueGT === "") {
			// 	vCase = 2;
			// } else if (vValueLT !== "" && vValueGT === "") {
			// 	vCase = 3;
			// } else if (vValueLT === "" && vValueGT !== "") {
			// 	vCase = 4;
			// }
			// switch(vCase) {
			// 	case 1: 
			// 		tPath += " and ACCESS ge " + vValueGT + " and ACCESS le " + vValueLT;
			// 		break;
			// 	// case 2:
			// 	// 	tPath += " and ROLE eq '" + vValueRole + "'";
			// 	// 	break;
			// 	case 3: 
			// 		tPath = " and ACCESS le " + vValueLT;
			// 		break;
			// 	case 4: 
			// 		tPath = " and ACCESS ge " + vValueGT;
			// }
				
			// if(vValueRole !== "")
			// {
			// 	if(vValueLT !== "" && vValueGT !== ""){
			// 		vCase = 1;
			// 	} else if(vValueLT === "" && vValueGT === "") {
			// 		vCase = 2;
			// 	} else if (vValueLT !== "" && vValueGT === "") {
			// 		vCase = 3;
			// 	} else if (vValueLT === "" && vValueGT !== "") {
			// 		vCase = 4;
			// 	}
			// 	switch(vCase) {
			// 		case 1: 
			// 			tPath = "plants>/USERS?$filter=(ACCESS ge " + vValueGT + " and ACCESS le " + vValueLT + " and ROLE eq '" + vValueRole + "')";
			// 			break;
			// 		case 2:
			// 			tPath = "plants>/USERS?$filter=(ROLE eq '" + vValueRole + "')";
			// 			break;
			// 		case 3: 
			// 			tPath = "plants>/USERS?$filter=(ACCESS le "+vValueLT+" and ROLE eq '" + vValueRole + "')";
			// 			break;
			// 		case 4: 
			// 			tPath = "plants>/USERS?&$filter=(ACCESS ge " + vValueGT+" and ROLE eq '" + vValueRole + "')";
			// 	}
			// }
			// else{
			// 	if(vValueLT !== "" && vValueGT !== ""){
			// 		vCase = 1;
			// 	} else if(vValueLT === "" && vValueGT === "") {
			// 		vCase = 2;
			// 	} else if (vValueLT !== "" && vValueGT === "") {
			// 		vCase = 3;
			// 	} else if (vValueLT === "" && vValueGT !== "") {
			// 		vCase = 4;
			// 	}
			// 	switch(vCase) {
			// 		case 1: 
			// 			tPath = "plants>/USERS?$filter=(ACCESS ge " + vValueGT + " and ACCESS le " + vValueLT + ")";
			// 			break;
			// 		case 2:
			// 			tPath = "plants>/USERS";
			// 			break;
			// 		case 3: 
			// 			tPath = "plants>/USERS?$filter=(ACCESS le "+vValueLT+")";
			// 			break;
			// 		case 4: 
			// 			tPath = "plants>/USERS?&$filter=(ACCESS ge " + vValueGT+")";
			// 	}
			// }
			tPath += ")";
			this.tableBindItems(tPath);
		},
		tableBindItems: function(tPath){
			var oTable = this.getView().byId("userDataTable");
			
			oTable.bindRows(tPath,
				new sap.m.ColumnListItem( {
				  type: "Active",
				  //press: this._onRowPress.bind(this),
				cells: [
					new sap.m.ObjectIdentifier({ text: "{plants>ID}" }),
					new sap.m.ObjectIdentifier({ text: {
						parts: [
							{path: "plants>SURNAME"},
						  	{path: "plants>NAME"},
						  	{path: "plants>PATRONYMIC"}
					  	],
					  	formatter: function(sValueSur, sValueName, sValue3Name){
					  		return sValueSur + " " + sValueName.split("")[0] + ". " + sValue3Name.split("")[0] + ".";
					  	}
					}}),
					  new sap.m.ObjectIdentifier({ text: "{plants>ROLE}"}),
					  new sap.m.Text({text: "{plants>SHORT_TEXT}"}),
					  new sap.m.Text({text: "{plants>DATESTART}"}),
					  new sap.m.Text({text: "{plants>DATEEND}"}),
					  new sap.m.Text({text: "{plants>STATUS}"}),
					  new sap.ui.core.Icon({press: this._onEditePress.bind(this), src: "sap-icon://edit", height: "35px", width: "35px"})
				]
				})
			);
		},
		userNameFormatter: function(surname, name, thirdname) {
			if(surname === null || name === null || thirdname === null)
			{
				return;
			}
			var sResult = "";
			sResult = surname + " " + name.split("")[0] + ". " + thirdname.split("")[0] + ".";
			return sResult;
		}
	});
}, /* bExport= */ true);

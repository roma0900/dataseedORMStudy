sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator"
], function(BaseController, MessageBox, Utilities, History, Filter, Sorter) {
	"use strict";
	var k=true;
	var arr = [];
	var green_lvl=90, yellow_lvl=70;
	return BaseController.extend("com.sap.build.standard.scopeCopy.controller.PlantsPage", {

		// handleRouteMatched: function(oEvent) {
		// 	var oParams = {};

		// 	if (oEvent.mParameters.data.context) {
		// 		this.sContext = oEvent.mParameters.data.context;
		// 		var oPath;
		// 		if (this.sContext) {
		// 			oPath = {
		// 				path: "/" + this.sContext,
		// 				parameters: oParams
		// 			};
		// 			this.getView().bindObject(oPath);
		// 		}
		// 	}
		// },
		// _onSideNavButtonPress: function() {
		// 	var oSideNavigation = this.byId("sideNavigation");
		// 	var bExpanded = oSideNavigation.getExpanded();
		// 	oSideNavigation.setExpanded(!bExpanded);
		// },
		
		tableBindItems: function(Date1,Date2) {
			//var oModel1 = this.getOwnerComponent().getModel("plants");
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oTreeTable = this.getView().byId("treeTable");
			// / *note that this oData service URL has NavDocs as expand node, treetable has capability
			// to find this node from you service metadata and map it in tree structure, that is the reason below i can simply directly use bindRows to treetable. */
			var this1 = this;
			var oResourseBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var path = "USERS";
			var oModel1= this.getOwnerComponent().getModel("third");
				oModel1.read( "/InputSH(IP_DATE1='"+Date1+"',IP_DATE2='"+Date2+"')/Results", {async : false, success:
				function(oData, oResponse) {
					var data=oData.results;
					var tree=[];
					var metadata={};
					for(var i=2;i<data.length;i++){
						var Node={};
						Node=data[i];
						if (Node.IS_LEAF!=='N') {
							Node.STORE__ADDRESS=Node.NODE_TEXT;
							Node.NODE_TEXT="Магазин "+Node.NODE;
						}
						tree.push(Node);
					}
					var flat = {};
		            for (var i = 0; i < tree.length; i++) {
		                var key = 'id' + tree[i].NODE;
		                flat[key] = tree[i];
		                flat[key].__metadata = "";
		            }
		            // add child container array to each node
		            for (var i in flat) {
		                flat[i].children = []; // add children container
		            }

		            // populate the child container arrays
		            for (var i in flat) {
		                var parentkey = 'id' + flat[i].PARENT;
		                if (flat[parentkey]) {
		                    flat[parentkey].children.push(flat[i]);
		                }
		            }
		            // find the root nodes (no parent found) and create the hierarchy tree from them
		            var root = [];
		            for (var i in flat) {
		                var parentkey = 'id' + flat[i].PARENT;
		                if (!flat[parentkey]) {
		                    root.push(flat[i]);
		                }
		            }
		            // here it is!
		            // to access the JSON via "/root" in bindRows(), could this be a problem??
		            var data = {
		                root: root
		            };
					oJSModel1.setData(data);
					oTreeTable.setModel(oJSModel1);
					oTreeTable.bindRows({
				            path : '/root',
				            parameters : {
				                countMode: 'Inline',
				                treeAnnotationProperties : {
				                    hierarchyNodeFor : 'NODE',
				                    hierarchyParentNodeFor : 'PARENT'
				                }
				            }
				        });
				},
					error:function(oError) { console.log(oError); }} );
		},
		// recursionTableCount:function(root)
		// {
		// 	if (Array.isArray(root)===true)
		// 	{
		// 		for(var i=0;i<root.length;i++)
		// 		{
		// 		  this.recursionTableCount(root[i]);
		// 		}
		// 	}
		// 	else{
		// 		if(root.children.length!=0 && !('MOVE_AMOUNT_1' in root.children[0]))
		// 		{
		// 			this.recursionTableCount(root.children);
		// 		}
		// 			if(root.children.length!=0 && ('MOVE_AMOUNT_1' in root.children[0])){
		// 				 root.MOVE_AMOUNT_1=0;
		// 				 root.MOVE_AMOUNT_2=0;
		// 				 root.MOVE_ICON=0;
		// 				 root.RTO_AMOUNT_1=0;
		// 				 root.RTO_AMOUNT_2=0;
		// 				 root.RTO_ICON=0;
		// 				 root.STOCK_AMOUNT_1=0;
		// 				 root.STOCK_AMOUNT_2=0;
		// 				 root.STOCK_ICON=0;
		// 				for(var i=0;i<root.children.length;i++)
		// 				{
		// 				   root.MOVE_AMOUNT_1+=+root.children[i].MOVE_AMOUNT_1;
		// 				   root.MOVE_AMOUNT_2+=+root.children[i].MOVE_AMOUNT_2;
		// 				   root.MOVE_ICON+=+root.children[i].MOVE_ICON;
		// 				   root.RTO_AMOUNT_1+=+root.children[i].RTO_AMOUNT_1;
		// 				   root.RTO_AMOUNT_2+=+root.children[i].RTO_AMOUNT_2;
		// 				   root.RTO_ICON+=+root.children[i].RTO_ICON;
		// 				   root.STOCK_AMOUNT_1+=+root.children[i].STOCK_AMOUNT_1;
		// 				   root.STOCK_AMOUNT_2+=+root.children[i].STOCK_AMOUNT_2;
		// 				   root.STOCK_ICON+=+root.children[i].STOCK_ICON;
		// 				}
		// 				return;
		// 			}
		// 	 }
		// },
		sorting: function()
		{
            var oColumn = this.getView().byId("AddressColumn").attachColumnMenuOpen(function()
            {
				var oMenu = oColumn.getMenu();
				var oMenuItemUp = new sap.ui.unified.MenuItem(
				{
					icon: "sap-icon://sort-ascending",
					text: "Сортировать по восходящей",
					select: function()
					{
						var oSorter = new sap.ui.model.Sorter("NODE_TEXT", false);
						var oTable = oColumn.getParent();
						oSorter.fnCompare=function(a,b){
							var a1=a.replace(/\s/g, '').replace(/\,/g, '').replace(/\./g, '');
							var b1=b.replace(/\s/g, '').replace(/\,/g, '').replace(/\./g, '');
							if (a1<b1) {return -1;}
							if (a1 > b1) {return 1;}
							if (a1 === b1) {return 0;}
						};
						oColumn.setSortOrder(sap.ui.table.SortOrder.Ascending);
						oTable.getBinding("rows").sort(oSorter);
					}
				});
				var oMenuItemDown = new sap.ui.unified.MenuItem(
				{
					icon: "sap-icon://sort-descending",
					text: "Сортировать по нисходящей",
					select: function()
					{
						var oSorter = new sap.ui.model.Sorter("NODE_TEXT", false);
						var oTable = oColumn.getParent();
						oSorter.fnCompare=function(a,b){
							var a1=a.replace(/\s/g, '').replace(/\,/g, '').replace(/\./g, '');
							var b1=b.replace(/\s/g, '').replace(/\,/g, '').replace(/\./g, '');
							if (a1<b1) {return 1;}
							if (a1 > b1) {return -1;}
							if (a1 === b1) {return 0;}
						};
						oColumn.setSortOrder(sap.ui.table.SortOrder.Descending);
						oTable.getBinding("rows").sort(oSorter);
					}
				});
				if (oMenu.getItems()[0]===undefined)
				{
					oMenu.addItem(oMenuItemUp);
					oMenu.addItem(oMenuItemDown);
				}
            });
            oColumn.getMenu().open();
		},
		setColumnLabel: function(column, value,oResourseBundle) {
			var checkArr = column.getLabel().getProperty("text").split(',');
			if(value/1000<100) {
				if(checkArr.length===1) {
					column.setLabel(column.getLabel().getProperty("text")+oResourseBundle.getText("rub"));
				}
				return 1;
			} else if(value/1000<1000) {
				if(checkArr.length===1) {
					column.setLabel(column.getLabel().getProperty("text")+oResourseBundle.getText("trub"));
				}
				return 1000;
			} else if (value/1000000 <1000) {
				if(checkArr.length===1)	{
					column.setLabel(column.getLabel().getProperty("text")+oResourseBundle.getText("trub"));
				}
				return 1000;
			} else if (value/1000000 <10000) {
				if(checkArr.length===1){
					column.setLabel(column.getLabel().getProperty("text")+oResourseBundle.getText("mrub"));
				}
				return 1000000;
			} else {
				if(checkArr.length===1){
					column.setLabel(column.getLabel().getProperty("text")+oResourseBundle.getText("brub"));
				}
				return 1000000000;
			}
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
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
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
		avatarInitialsFormatter: function(sTextValue) {
			return typeof sTextValue === 'string' ? sTextValue.substr(0, 2) : undefined;
		},
		handleConfirm: function (oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource();
			this._filterModel(oFacetFilter);
			console.log("confirm event fired");
		},
		_filterModel: function(oFacetFilter) {
			var mFacetFilterLists = oFacetFilter.getLists().filter(function(oList) {
				return oList.getSelectedItems().length;
			});

			if (mFacetFilterLists.length) {
				// Build the nested filter with ORs between the values of each group and
				// ANDs between each group
				var oFilter = new Filter(mFacetFilterLists.map(function(oList) {
					return new Filter(oList.getSelectedItems().map(function(oItem) {
						return new Filter(oList.getTitle(), "EQ", oItem.getText());
					}), false);
				}), true);
				this._applyFilter(oFilter);
			} else {
				this._applyFilter([]);
			}
		},
		_applyFilter: function(oFilter) {
			// Get the table (last thing in the VBox) and apply the filter
			var aVBoxItems = this.byId("idVBox").getItems();
			var oTable = aVBoxItems[aVBoxItems.length - 1];
			oTable.getBinding("rows").filter(oFilter);
		},
		handleFacetFilterReset: function(oEvent) {
			var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
			var aFacetFilterLists = oFacetFilter.getLists();
			for (var i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
			}
			this._applyFilter([]);
		},

		handleListClose: function(oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource().getParent();
			this._filterModel(oFacetFilter);
		},
		_onTableItemPress: function(oEvent) {
			//var oBindingContext = oEvent.getSource().getBindingContext();
			var Sp=oEvent.getSource().getBindingContext().getPath("NODE");
			var Sp1=oEvent.getSource().getBindingContext().getPath("NODE_TEXT");
			var Sp2=oEvent.getSource().getBindingContext().getPath("NODE_TEXT");
			var TreeTable=this.byId("treeTable");
			var modelData=TreeTable.getModel();
			var PlantFromTable = modelData.getProperty(Sp);
			var addressFromTable = modelData.getProperty(Sp1);
			var  nameFromTable= modelData.getProperty(Sp2);
			if(!addressFromTable)
			{
				addressFromTable=nameFromTable;
			}
					var json = {};
					json.shopAddress = addressFromTable;
					json.Plant = PlantFromTable;
					sap.ui.getCore().getModel("Modelbreadcrumbs").setData(json);
					//sap.ui.getCore().getMOdel("plants").setData(this.getOwnerComponent().getModel("plants").)
				var NavC = this.getView().oParent.oParent.oParent.byId("pageContainer");
				if(NavC.getPage("page4")===null){
					var page4 = sap.ui.view("page4",{id:"application-BUILD-prototype-component---KPIPage",
					viewName:"com.sap.build.standard.scopeCopy.view.KPIPage",
					type:sap.ui.core.mvc.ViewType.XML});
					page4.oViewData = this.getView().getViewData();
					NavC.addPage(page4);
					NavC.to("page4");
				}
				else{
					NavC.to("page4");
				}
		},
		formatDateUTCtoLocale: function(dDate) {
			if (dDate) {
				return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
			}
			return dDate;
		},


		_onPageNavButtonPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {
				this.doNavigate("AuthorizationPage", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});


		},
		comp : function(a,b){
			return 0;
        },
		_onSearchFieldLiveChange: function(oEvent) {
			var sQuery = oEvent.getSource().getValue().trim(); //запрос
			var oTree = this.byId("treeTable");
			var oBinding = oTree.getBinding("rows"); //элементы
			var oRes = []; //здесь сохраним ноды, в NODE_TEXT или в STORE__ADDRESS которых есть запрос
			var oFilter1 = new Filter({
				filters: [ 
					new Filter({			       
						path:false,
			        	test: function (oNode) {
			        		if((oNode.NODE_TEXT.toUpperCase().includes(sQuery.toUpperCase())) || 
			        		(oNode.STORE__ADDRESS!=null && oNode.STORE__ADDRESS.toUpperCase().includes(sQuery.toUpperCase()))){
				        		oRes.push(oNode);
				        	}
				        	return true; 
				    	}
				})]}); 
			oBinding.filter(oFilter1, "Control");
			oBinding.aFilters = null;
			oTree.getModel().refresh(true);
			
			var oFilter2 = new Filter({
				filters: [ 
					new Filter({
				        path:false,
				        test: function (oNode) {
				        	if(oNode!=undefined){
			        			// console.log(oNode);
					        	for(var i in oRes){
									//если в пути очередной ноды есть номер ноды из res, значит это либо ее потомок, либо сама нода из res
									//например при запросе "Татарстан" в res будет нода с NODE = 6
									//и путь к любому магазину из Татарстана будет содержать число 6, например 4/5/6/7/2264/
									var strs = oNode.PATH.split("/"); 
									if( strs.includes(oRes[i].NODE)){
										return true;
									}
					        	}
				        	}
				        	return false;
	    				}
					})]});
			
			if(sQuery!==""){
				oBinding.filter(oFilter2, "Control");
				oTree.expandToLevel(4);
			}
			else{
				oTree.collapseAll();
				oTree.expandToLevel(1);
			}
		},


		onInit: function() {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("PlantsPage").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var dayDate1 = new Date(2017, 10, 7);
			var dayDate2 = new Date(2017, 10, 8);
			this.getView().byId("DP1").setDateValue(dayDate1);
			this.getView().byId("DP2").setDateValue(dayDate2);
			var oModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oModel, "Modelbreadcrumbs");
			this.getView().addEventDelegate({
			   onAfterShow: function(evt) {
			   		//evt.to.getController().setPage(evt.from);
			   		evt.to.getViewData()(evt.to);
			   }
			});
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYYMMdd" });
			var dd = dateFormat.format(dayDate1);
			var dd2 = dateFormat.format(dayDate2);
			this.tableBindItems(dd,dd2);
			this.sorting();
		},
		PeriodTypeChanged: function(e) {

			switch(e.getSource().mProperties.selectedKey){
				case "day":
					var dayDate1  = this.getView().byId("DP1").getDateValue();
					var dayDate2 = new Date(dayDate1);
					dayDate2.setDate(dayDate1.getDate()+1);
					this.getView().byId("DP2").setDateValue(dayDate2);
					break;
				case "Week":
					var weekDate1  = this.getView().byId("DP1").getDateValue();
					var weekDate2 = new Date(weekDate1);
					var day = weekDate1.getDay();
					if(day === 0) {
					weekDate2.setDate(weekDate1.getDate());
					weekDate1.setDate(weekDate2.getDate()-6);
					} else {
					weekDate1.setDate(weekDate1.getDate()-day+1);
					weekDate2.setDate(weekDate1.getDate()+6);
					}

					if(weekDate1.getMonth()!==weekDate2.getMonth()) {
						var endMon = new Date( (new Date(weekDate1.getFullYear(), weekDate1.getMonth()+1,1))-1 );
						var part1 = endMon.getDay();
						var part2 = 7-part1;
						weekDate2.setMonth(weekDate1.getMonth()+1);
						weekDate2.setDate(part2);
						if(weekDate2.getMonth()===0){
							weekDate2.setFullYear(weekDate1.getFullYear()+1);
						}
					}

					this.getView().byId("DP1").setDateValue(null);
					this.getView().byId("DP1").setDateValue(weekDate1);
					this.getView().byId("DP2").setDateValue(weekDate2);
					break;
				case "Month":
					var monthDate1  = this.getView().byId("DP1").getDateValue();
					var monthDate2 = new Date(monthDate1);
					monthDate1.setDate(1);
					var mlastDay = new Date( (new Date(monthDate1.getFullYear(), monthDate1.getMonth()+1,1))-1 );
					monthDate2 = new Date(mlastDay);
					this.getView().byId("DP1").setDateValue(null);
					this.getView().byId("DP1").setDateValue(monthDate1);
					this.getView().byId("DP2").setDateValue(monthDate2);
					break;
				case "Quarter":
					var qDate1  = this.getView().byId("DP1").getDateValue();
					var qDate2 = new Date(qDate1);
					qDate1.setDate(1);
					switch(qDate1.getMonth()){
						case 0:
						case 1:
						case 2: qDate1.setMonth(0);
						var mlastDay = new Date( (new Date(qDate1.getFullYear(), 3,1))-1 );
						qDate2 = new Date(mlastDay);
						break;
						case 3:
						case 4:
						case 5: qDate1.setMonth(3);
						var mlastDay = new Date( (new Date(qDate1.getFullYear(), 6,1))-1 );
						qDate2 = new Date(mlastDay);
						break;
						case 6:
						case 7:
						case 8: qDate1.setMonth(6);
						var mlastDay = new Date( (new Date(qDate1.getFullYear(), 9,1))-1 );
						qDate2 = new Date(mlastDay);
						break;
						case 9:
						case 10:
						case 11: qDate1.setMonth(9);
						var mlastDay = new Date( (new Date(qDate1.getFullYear(), 11+1,1))-1 );
						qDate2 = new Date(mlastDay);
					}
					this.getView().byId("DP1").setDateValue(null);
					this.getView().byId("DP1").setDateValue(qDate1);
					this.getView().byId("DP2").setDateValue(qDate2);
					break;
				case "Year":
					var yearDate1  = this.getView().byId("DP1").getDateValue();
					var yearDate2 = new Date(yearDate1);
					yearDate1.setDate(1);
					yearDate1.setMonth(0);

					yearDate2.setDate(31);
					yearDate2.setMonth(11);
					this.getView().byId("DP1").setDateValue(null);
					this.getView().byId("DP1").setDateValue(yearDate1);
					this.getView().byId("DP2").setDateValue(yearDate2);
			}
		},

		handleChange: function(e) {
			var Date1  = this.getView().byId("DP1").getDateValue();
			var Date2 = new Date(Date1);
			switch(this.getView().byId("selectId").mProperties.selectedKey){
				case "day": Date2.setDate(Date1.getDate()+1);
					break;
				case "Week":
					var day = Date1.getDay();
					if(day === 0) {
					Date2.setDate(Date1.getDate());
					Date1.setDate(Date2.getDate()-6);
					} else{
					Date1.setDate(Date1.getDate()-day+1);
					Date2.setDate(Date1.getDate()+6);}

					if(Date1.getMonth()!==Date2.getMonth()) {
						var endMon = new Date( (new Date(Date1.getFullYear(), Date1.getMonth()+1,1))-1 );
						var part1 = endMon.getDay();
						var part2 = 7-part1;
						Date2.setMonth(Date1.getMonth()+1);
						Date2.setDate(part2);
						if(Date2.getMonth()===0){
							Date2.setFullYear(Date1.getFullYear()+1);
						}
					}
					break;
				case "Month":
					Date1.setDate(1);
					var mlastDay = new Date( (new Date(Date1.getFullYear(), Date1.getMonth()+1,1))-1 );
					Date2 = new Date(mlastDay);
					break;
				case "Quarter":
					Date1.setDate(1);
					switch(Date1.getMonth()){
						case 0:
						case 1:
						case 2: Date1.setMonth(0);
						var mlastDay = new Date( (new Date(Date1.getFullYear(), 3,1))-1 );
						Date2 = new Date(mlastDay);
						break;
						case 3:
						case 4:
						case 5: Date1.setMonth(3);
						var mlastDay = new Date( (new Date(Date1.getFullYear(), 6,1))-1 );
						Date2 = new Date(mlastDay);
						break;
						case 6:
						case 7:
						case 8: Date1.setMonth(6);
						var mlastDay = new Date( (new Date(Date1.getFullYear(), 9,1))-1 );
						Date2 = new Date(mlastDay);
						break;
						case 9:
						case 10:
						case 11: Date1.setMonth(9);
						var mlastDay = new Date( (new Date(Date1.getFullYear(), 11+1,1))-1 );
						Date2 = new Date(mlastDay);
					}
					break;
				case "Year":
					Date1.setDate(1);
					Date1.setMonth(0);
					Date2.setDate(31);
					Date2.setMonth(11);
			}
			this.getView().byId("DP1").setValue(null);
			this.getView().byId("DP2").setValue(null);
			this.getView().byId("DP1").setDateValue(Date1);
			this.getView().byId("DP2").setDateValue(Date2);
			this.refreshData();
		},

		handleChange2: function(e) {
			var Date2  = this.getView().byId("DP2").getDateValue();
			var Date1 = new Date(Date2);
			switch(this.getView().byId("selectId").mProperties.selectedKey){
				case "day": Date1.setDate(Date2.getDate()-1);
				break;
				case "Week":
				var day = Date2.getDay();
				if(day === 0) {
				Date2.setDate(Date2.getDate());
				Date1.setDate(Date2.getDate()-6);
				} else {
				Date2.setDate(Date2.getDate()-day+7);
				Date1.setDate(Date2.getDate()-6);
				}

				if(Date1.getMonth()!==Date2.getMonth()) {
					Date1.setMonth(Date2.getMonth()-1);

					var endMon = new Date( (new Date(Date1.getFullYear(), Date1.getMonth()+1,1))-1 );
					var part1 = endMon.getDay();
					var newDate = endMon.getDate()-part1+1;
					Date1.setDate(newDate);
					if(Date1.getMonth()===0){
						Date1.setFullYear(Date2.getFullYear()-1);
					}
				}
				break;
				case "Month":
				var lastDay = new Date( (new Date(Date2.getFullYear(), Date2.getMonth()+1,1))-1 );
				Date2 = new Date(lastDay);
				Date1.setDate(1);
				break;
				case "Quarter":
				Date1.setDate(1);
				switch(Date1.getMonth()){
					case 0:
					case 1:
					case 2: Date1.setMonth(0);
					var mlastDay = new Date( (new Date(Date1.getFullYear(), 3,1))-1 );
					Date2 = new Date(mlastDay);
					break;
					case 3:
					case 4:
					case 5: Date1.setMonth(3);
					var mlastDay = new Date( (new Date(Date1.getFullYear(), 6,1))-1 );
					Date2 = new Date(mlastDay);
					break;
					case 6:
					case 7:
					case 8: Date1.setMonth(6);
					var mlastDay = new Date( (new Date(Date1.getFullYear(), 9,1))-1 );
					Date2 = new Date(mlastDay);
					break;
					case 9:
					case 10:
					case 11: Date1.setMonth(9);
					var mlastDay = new Date( (new Date(Date1.getFullYear(), 11+1,1))-1 );
					Date2 = new Date(mlastDay);
				}
				break;
				case "Year": Date2.setDate(31);
				Date2.setMonth(11);
				Date1.setDate(1);
				Date1.setMonth(0);
			}
			this.getView().byId("DP1").setValue(null);
			this.getView().byId("DP2").setValue(null);
			this.getView().byId("DP1").setDateValue(Date1);
			this.getView().byId("DP2").setDateValue(Date2);
			this.refreshData();
		},
		onLeftPress: function(){
			var Date1  = this.getView().byId("DP1").getDateValue();
			var newDate = new Date();
			switch(this.getView().byId("selectId").mProperties.selectedKey){
				case "day":
					Date1.setDate(Date1.getDate()-1);
					newDate = new Date(Date1);
					break;
				case "Week":
					Date1.setDate(Date1.getDate()-7);
					newDate = new Date(Date1);
					break;
				case "Month":
					newDate = new Date(Date1.getFullYear(), Date1.getMonth()-1,1);
					break;
				case "Quarter":
					switch(Date1.getMonth()){
						case 0:
						case 1:
						case 2:
							newDate = new Date(Date1.getFullYear()-1, 9,1);
							break;
						case 3:
						case 4:
						case 5:
							newDate = new Date(Date1.getFullYear(), 0,1);
							break;
						case 6:
						case 7:
						case 8:
							newDate = new Date(Date1.getFullYear(), 3,1);
							break;
						case 9:
						case 10:
						case 11:
							newDate = new Date(Date1.getFullYear(), 6,1);
					}
					break;
				case "Year":
					newDate = new Date(Date1.getFullYear()-1, 0,1);
			}
			this.getView().byId("DP1").setValue(null);
			this.getView().byId("DP1").setDateValue(newDate);
			this.refreshData();
			this.handleChange();
		},
		onRightPress: function(){
			var Date1  = this.getView().byId("DP1").getDateValue();
			var newDate = new Date();
			switch(this.getView().byId("selectId").mProperties.selectedKey){
				case "day":
					Date1.setDate(Date1.getDate()+1);
					newDate = new Date(Date1);
					break;
				case "Week":
					Date1.setDate(Date1.getDate()+7);
					newDate = new Date(Date1);
					break;
				case "Month":
					newDate = new Date(Date1.getFullYear(), Date1.getMonth()+1,1);
					break;
				case "Quarter":
					switch(Date1.getMonth()){
						case 0:
						case 1:
						case 2:
							newDate = new Date(Date1.getFullYear(), 3,1);
							break;
						case 3:
						case 4:
						case 5:
							newDate = new Date(Date1.getFullYear(), 6,1);
							break;
						case 6:
						case 7:
						case 8:
							newDate = new Date(Date1.getFullYear(), 9,1);
							break;
						case 9:
						case 10:
						case 11:
							newDate = new Date(Date1.getFullYear()+1, 0,1);
					}
					break;
				case "Year":
					newDate = new Date(Date1.getFullYear()+1, 0,1);
			}
			this.getView().byId("DP1").setValue(null);
			this.getView().byId("DP1").setDateValue(newDate);
			this.refreshData();
			this.handleChange();
		},
		refreshData: function(){
			var Date1  = this.getView().byId("DP1").getDateValue();
			var Date2  = this.getView().byId("DP2").getDateValue();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYYMMdd" });
			var dd = dateFormat.format(Date1);
			var dd2 = dateFormat.format(Date2);
			this.tableBindItems(dd,dd2);
		},
        rtoState : 	function (kpi) {
			if(kpi>green_lvl) {
				return "#00CF00";//green
			} else if(kpi >yellow_lvl) {
				return "#FFAF25";//yellow
			} else {
				return "#FF2525";//red
			}

		}
	});


}, /* bExport= */ true);
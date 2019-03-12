sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter"
], function(BaseController, MessageBox, Utilities, History, FilterOperator ,Filter, Sorter) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.scopeCopy.controller.TGDetailPage", {
		refreshData: function(){
			var Date1  = this.getView().byId("DP1").getDateValue();
			var Date2  = this.getView().byId("DP2").getDateValue();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYYMMdd" });
			var dd = dateFormat.format(Date1);
			var dd2 = dateFormat.format(Date2);
			this.handleRouteMatched(dd,dd2);
		},
		setPieChart: function(date1,date2) {
				this.getView().byId("idPieChart").setVisible(true);
				this.getView().byId("idBarChart").setVisible(false);
				var VizFrameBar = this.getView().byId("idbarchart");
				VizFrameBar.setVisible(false);
				var oPopOver = this.getView().byId("idPopOver");
				var oVizFrame = this.getView().byId("idpiechart");
				oVizFrame.setVisible(true);
				oVizFrame.destroyDataset();
    		oVizFrame.destroyFeeds();
				var path="/InputG" + this.hierarchyLevel + "(IP_DATE1='"+date1+"',IP_DATE2='"+date2+"',IP_DTYPE='"+sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/idKPI")+"')/Results?";
				var filters = [new Filter("NODE", FilterOperator.EQ, "'"+this.PLANT+"'")];
				var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{
				        name : "TG",
					value : "{PGROUP1__TXTMD}"}],

				measures : [{
					name : "SUM",
					value : "{AMOUNT_2}"}],

				data : {
					path : path,
					filters:filters
					//sorter: new sap.ui.model.Sorter("RTO_AMOUNT_1", false)
				}
					});
			oVizFrame.setDataset(oDataset);

			oVizFrame.setVizProperties({
				plotArea:{
                            dataLabel:{visible: true}
			    },
				title:{
					visible : false
				},
				legendGroup:{layout:{position: 'left'}}
			});

		var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
		      'uid': "size",
		      'type': "Measure",
		      'values': ["SUM"]
		    }),
		    feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
		      'uid': "color",
		      'type': "Dimension",
		      'values': ["TG"]
		    });
		oVizFrame.addFeed(feedSize);
		oVizFrame.addFeed(feedColor);
		oPopOver.connect(oVizFrame.getVizUid());
		},
		setBarChart: function(data) {
			this.getView().byId("idPieChart").setVisible(false);
			this.getView().byId("idBarChart").setVisible(true);

			var oVizFrame = this.getView().byId("idpiechart");
			oVizFrame.setVisible(false);
			var oPopOver = this.getView().byId("idPopOverbar");
			var oVizFramebar = this.getView().byId("idbarchart");
			oVizFramebar.setVisible(true);
			oVizFramebar.destroyDataset();
    		oVizFramebar.destroyFeeds();
    		var oModel = new sap.ui.model.json.JSONModel();
    		oModel.setData(data);
			var oResourseBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var Plan = oResourseBundle.getText("Plan");
			var Fact = oResourseBundle.getText("Fact");
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{
				    name : "TG",
					value : "{name}"}],

				measures :  [{name : Plan, value : "{plan}", group:1},
							 {name : Fact, value : "{fact}", group:1}
							],

				data : {
					path : "/"
				}
			});
			oVizFramebar.setDataset(oDataset);
			oVizFramebar.setModel(oModel);

			oVizFramebar.setVizProperties({
				title:{
					text : this.forTitle[this.hierarchyLevel-1]
				},
				legend: {
                	visible: true
            	},
            	legendGroup:{layout:{position: 'bottom'}},
            	valueAxis: {
                    title: {
                        visible: false
                    }
            	},
            	valueAxis2: {
                    title: {
                        visible: false
                    }
            	},
                categoryAxis: {
                    title: {
                        visible: false
                    },
                    layout:{
                		maxWidth:0.25
                	}
            	},
            	plotArea : {dataPointSize: {min : 10, max : 10}}
			});

			var feedPrimaryValues = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': [Fact]
		    }),
		    feedAxisLabels = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "categoryAxis",
				'type': "Dimension",
				'values': ["TG"]
		    }),
		    feedTargetValues = new sap.viz.ui5.controls.common.feeds.FeedItem({
        		'uid': "valueAxis2",
	            'type': "Measure",
	            'values': [Plan]
        	});

			oVizFramebar.addFeed(feedPrimaryValues);
			oVizFramebar.addFeed(feedAxisLabels);
			oVizFramebar.addFeed(feedTargetValues);
			oPopOver.connect(oVizFramebar.getVizUid());
		},
		tableBindItems: function(path,filters){
			var oModel1 =  this.getView().getModel();
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var this1 = this;
			var oTable = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
			var this1 = this;
				oTable.addEventDelegate({
					onAfterRendering: function(oEvent) {
						var oBinding = oTable.getBinding("rows");

						if(oBinding===undefined){
							return;
						}
						oBinding.attachChange(function(oEvent) {
							if(this1.hierarchyLevel!==1){
								this1.changeChart(0);
							}
						});
					}
			    }, oTable);
			oTable.setBusyIndicatorDelay(0);
			oTable.setBusy(true);
			oModel1.read(path, {async : false,filters:filters, success:
			function(oData, oResponse) {
				var data=oData.results;
				// var tree=[];
				// var metadata={};
				var SUMmin = data[0].AMOUNT_2;
				for(var i=0;i<data.length;i++){
					if(data[i].AMOUNT_2<SUMmin){
						SUMmin = data[i].AMOUNT_2;
					}
				}

	            var n = this1.setColumnLabel(SUMmin);

	            for(var i=0;i<data.length;i++){
	            	if(data[i].AMOUNT_2!==null){
						data[i].AMOUNT_2 = data[i].AMOUNT_2/n;
	            	}
	            	else{
	            		data[i].AMOUNT_2 = 0;
	            	}
	            	if(data[i].AMOUNT_1!==null){
						data[i].AMOUNT_1 = data[i].AMOUNT_1/n;
	            	}
	            	else{
	            		data[i].AMOUNT_1 = 0;
	            	}
				}

				oTable.removeAllColumns();
				var pgroup;
				var pgroup_txt;
				var text;
				var sRub;
				switch(n){
					case 1:
						sRub="{i18n>rub}";
						break;
					case 1000:
						sRub="{i18n>trub}";
						break;
					case 1000000:
						sRub="{i18n>mrub}";
						break;
					case 1000000000:
						sRub="{i18n>brub}";
				}
				switch(this1.hierarchyLevel){
					case 1:
						pgroup = "PGROUP1_ID";
						pgroup_txt = "PGROUP1__TXTMD";
						text = "{i18n>TG}";
						break;
					case 2:
						pgroup = "PGROUP2_ID";
						pgroup_txt = "PGROUP2__TXTMD";
						text = "{i18n>TG}";
						break;
					case 3:
						pgroup = "PGROUP3_ID";
						pgroup_txt = "PGROUP3__TXTMD";
						text = "{i18n>TG}";
						break;
					case 4:
						pgroup = "PGROUP4_ID";
						pgroup_txt = "PGROUP4__TXTMD";
						text = "{i18n>TG}";
						break;
					case 5:
						pgroup = "PRODUCT_ID";
						pgroup_txt = "PRODUCT__TXTMD";
						text = "{i18n>MaterialID}";
				}
			    oTable.addColumn(new sap.ui.table.Column({
			      label: new sap.m.Label({
			        text: text,
			        wrapping: true,
					wrappingType: "Hyphenated"
			      }).addStyleClass("columnLabel"),
			      template: new sap.m.Text({text: {path:pgroup}}),
			      sortProperty: pgroup,
			      filterProperty: pgroup,
			      popinDisplay: "Inline"
			    }).setWidth("21%"));

			    oTable.addColumn(new sap.ui.table.Column({
			      label: new sap.m.Label({
			        text: "{i18n>Name}",
			        wrapping: true,
					wrappingType: "Hyphenated"
			      }).addStyleClass("columnLabel"),
			      template: new sap.m.Text({text: {path:pgroup_txt}, tooltip: {path:pgroup_txt}}),
			      sortProperty: pgroup_txt,
			      filterProperty: pgroup_txt,
			      popinDisplay: sap.m.PopinDisplay.Inline,
			      demandPopin: "false"
			    }));

			    oTable.addColumn(new sap.ui.table.Column({
			      label: new sap.m.Label({
			        text: "{i18n>Sum}"+sRub,
			        wrapping: true,
					wrappingType: "Hyphenated"
			      }).addStyleClass("columnLabel"),
			      template: new sap.m.Text({text:
								{path: "AMOUNT_2", type: "sap.ui.model.type.Float", formatOptions: {maxFractionDigits: 0}}
			    			}),
			      sortProperty: "AMOUNT_2"
			    }).setWidth("15%"));

			    oTable.addColumn(new sap.ui.table.Column({
			      label: new sap.m.Label({
			        text: "{i18n>Plan}"+sRub,
			        wrapping: true,
					wrappingType: "Hyphenated"
			      }).addStyleClass("columnLabel"),
			      template: new sap.m.Text({text:
								{path: "AMOUNT_1", type: "sap.ui.model.type.Float", formatOptions: {maxFractionDigits: 0}}
			    			}),
			      sortProperty: "AMOUNT_1"
			    }).setWidth("15%"));

			    oTable.addColumn(new sap.ui.table.Column({
			      label: new sap.m.Label({
			        text: "{i18n>Deviation}",
			        wrapping: true,
					wrappingType: "Hyphenated"
			      }).addStyleClass("columnLabel"),
			      template: new sap.m.Text({text:
								{	path: "DEVIATION",  type: "sap.ui.model.type.Float", formatOptions: {maxFractionDigits: 1}	}
			    		}),
			      sortProperty: "DEVIATION"
			    }).setWidth("20%"));

			    oTable.bindRows("/");
				oJSModel1.setData(data);
				oTable .setModel(oJSModel1);
				oTable.bindRows({
			            path : '/'});

				var rowCount = oTable.getVisibleRowCount(); //number of visible rows
				var chartData=[];
				for (var i = 0; i < rowCount; i++) {
				    var object = data[i];
				    if(object===undefined){
				    	break;
				    }
						var item = {};
						switch(this1.hierarchyLevel){
							case 2:
								if(object.PGROUP2__TXTMD!==undefined){
								item.name = object.PGROUP2__TXTMD;
								}
								break;
							case 3:
								if(object.PGROUP3__TXTMD!==undefined){
								item.name = object.PGROUP3__TXTMD;
								}
								break;
							case 4:
								if(object.PGROUP4__TXTMD!==undefined){
								item.name = object.PGROUP4__TXTMD;
								}
								break;
							case 5:
								if(object.PRODUCT__TXTMD!==undefined){
								item.name = object.PRODUCT__TXTMD;
								}
						}
						item.plan = object.AMOUNT_1;
						item.fact = object.AMOUNT_2;
						chartData.push(item);
				}
				if(this1.hierarchyLevel!==1){
				this1.setBarChart(chartData);
				oTable.setBusy(false);
				}
				 },
				error:function(oError) {
					oTable.setBusy(false);
					console.log(oError);
				}});

				if(this.hierarchyLevel===5){
					this.getView().byId("rowAction").setVisible(false);
				}
				else{
					this.getView().byId("rowAction").setVisible(true);
				}
		},
		changeChart: function(rowStart){
			var oTable = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
			var rowCount = oTable.getVisibleRowCount(); //number of visible rows
			//var rowStart = oTable.getFirstVisibleRow();
			var data=[];
			for (var i = 0; i < rowCount; i++) {
				if (oTable.getContextByIndex(rowStart + i) !== undefined) {
				var object = oTable.getContextByIndex(rowStart + i).getObject();
				//var tRows = Table1.getRows();
					var item = {};
					switch(this.hierarchyLevel){
						case 2:
							item.name = object.PGROUP2__TXTMD;
							break;
						case 3:
							item.name = object.PGROUP3__TXTMD;
							break;
						case 4:
							item.name = object.PGROUP4__TXTMD;
							break;
						case 5:
							item.name = object.PRODUCT__TXTMD;
					}
					item.plan = object.AMOUNT_1;
					item.fact = object.AMOUNT_2;
					data.push(item);
				}
			}
			this.setBarChart(data);
		},
		tableScroll: function(oEvent){
			  //var oTable = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
			  //var rowCount = oTable.getVisibleRowCount(); //number of visible rows
	          var rowStart = oEvent.getParameter("firstVisibleRow");
	          this.changeChart(rowStart);
	    //       var data=[];
	    //       for (var i = 0; i < rowCount; i++) {
	    //         if (oTable.getContextByIndex(rowStart + i) !== undefined) {
	    //             var object = oTable.getContextByIndex(rowStart + i).getObject();
					// 	var item = {};
					// 	switch(this.hierarchyLevel){
					// 		case 2:
					// 			item.name = object.PGROUP2__TXTMD;
					// 			break;
					// 		case 3:
					// 			item.name = object.PGROUP3__TXTMD;
					// 			break;
					// 		case 4:
					// 			item.name = object.PGROUP4__TXTMD;
					// 			break;
					// 		case 5:
					// 			item.name = object.PRODUCT__TXTMD;
					// 	}
					// 	item.plan = object.AMOUNT_1;
					// 	item.fact = object.AMOUNT_2;
					// 	data.push(item);
					// }
	    //         }
	    //         this.setBarChart(data);
		},
		handleRouteMatched: function(date1,date2) {
			if (!date1) {
				date1="20171107";
				date2="20171108";
			}
			var dataPoint1Shop = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/shopAddress");
			this.getView().byId("idShop").setText(dataPoint1Shop);
			this.getView().byId("idShop").setText("Магазины");
			var dataPoint2Tile = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/KPI");
			this.getView().byId("idKPI").setText(dataPoint2Tile);
			this.getView().byId("idKPI").setText(dataPoint1Shop);
			this._linkVisible();
			this.getView().byId("idBreadCrumb").setCurrentLocationText(dataPoint2Tile);
			this.hierarchyLevel = 1;
			this.PLANT = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/Plant");
			//var oModel = this.getOwnerComponent().getModel("plants");
			var oModel = this.getView().getModel();
			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799").setModel(oModel, "data");
			var tPath="/InputG" + this.hierarchyLevel + "(IP_DATE1='"+date1+"',IP_DATE2='"+date2+"',IP_DTYPE='"+sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/idKPI")+"')/Results?";
			var filters = [new Filter("NODE", sap.ui.model.FilterOperator.EQ, this.PLANT)];
			this.lastFilters=filters
			this.lastPath = tPath;
			this.tableBindItems(tPath,filters);
		//	this.byId("sap_m_Page_0-content-build_simple_Table-1534593457799").getBinding("rows").sort(new Sorter("SUM", false));
			this.setPieChart(date1,date2);
		},
		tableSort: function(oEvent) {
			if(this.hierarchyLevel===1){
				return;
			}

			// var colSort = oEvent.getParameters().column.mProperties.sortProperty;
			// var sortOrder = oEvent.getParameters().sortOrder;
			// var tableSorter = new sap.ui.model.Sorter(colSort, (sortOrder === "Descending"));
			// this.setBarChart(tableSorter);
			 //var oTable = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799");

			// oTable.addEventDelegate({
			//      onAfterSort: function(oEvent){
			//             var tRows = oTable.getRows();
			// 			var data=[];
			// 			for(var i=0; i<tRows.length; i++){
			// 				var item = {};
			// 				item.name = tRows[i].getCells()[1].getProperty("text");
			// 				item.plan = tRows[i].getCells()[3].getProperty("text");
			// 				item.fact = tRows[i].getCells()[2].getProperty("text");
			// 				data.push(item);
			// 				this.setBarChart(data);
			// 			}
			// }}, oTable);
			// console.log(this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799").getRows()[0].getCells());
		},
		rowSelectionChange: function(oEvent){

		},
		_onLinkPressPrGr1: function(oEvent)
		{
			if(oEvent !== undefined) {
				this.hierarchyLevel = 2;
			}
			var currText = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/KPI");
			this.getView().byId("idBreadCrumb").setCurrentLocationText(currText);
			//this.getView().byId("idProdGroup").setText("Товарная группа");
			this.getView().byId("idPrGr1").setVisible(false);
			this.getView().byId("idPrGr2").setVisible(false);
			this.getView().byId("idPrGr3").setVisible(false);
			if(oEvent !== undefined) {
				this._onPageNavButtonPress();
			}
		},
		_onLinkPressPrGr2: function(oEvent)
		{
			if(oEvent !== undefined) {
				this.hierarchyLevel = 3;
			}
			this.getView().byId("idBreadCrumb").setCurrentLocationText(this.forTitle[this.hierarchyLevel-2]);
			//this.getView().byId("idProdGroup").setText(this.getView().byId("idPrGr1").getText());
			this.getView().byId("idPrGr2").setVisible(false);
			this.getView().byId("idPrGr3").setVisible(false);
			if(oEvent !== undefined) {
				this._onPageNavButtonPress();
			}
		},
		_onLinkPressPrGr3: function(oEvent)
		{
			if(oEvent !== undefined) {
				this.hierarchyLevel = 4;
			}
			this.getView().byId("idBreadCrumb").setCurrentLocationText(this.forTitle[this.hierarchyLevel-2]);
			//this.getView().byId("idProdGroup").setText(this.getView().byId("idPrGr2").getText());
			this.getView().byId("idPrGr3").setVisible(false);
			if(oEvent !== undefined) {
				this._onPageNavButtonPress();
			}
		},
		_onLinkPressPrGr4: function(oEvent)
		{
			if(oEvent !== undefined) {
				this.hierarchyLevel = 5;
			}
			this.getView().byId("idBreadCrumb").setCurrentLocationText(this.forTitle[this.hierarchyLevel-2]);
			//this.getView().byId("idProdGroup").setText(this.getView().byId("idPrGr3").getText());
			if(oEvent !== undefined) {
				this._onPageNavButtonPress();
			}
		},
		_onPageNavButtonPress: function(oEvent,date1,date2) {
			if (!date1) {
				date1="20171107";
				date2="20171108";
			}
			if(oEvent !== undefined) {
				switch(this.hierarchyLevel){
					case 5: this._onLinkPressPrGr4();
					break;
					case 4: this._onLinkPressPrGr3();
					break;
					case 3: this._onLinkPressPrGr2();
					break;
					case 2: this._onLinkPressPrGr1();
				}
			}
			if(this.hierarchyLevel!==0){
				this.hierarchyLevel--;
			}
			var path;
			this.getView().byId("idPrGr4").setVisible(false);
			if(this.hierarchyLevel > 1)
			{
				path="/InputG" + this.hierarchyLevel + "(IP_DATE1='"+date1+"',IP_DATE2='"+date2+"',IP_DTYPE='"+sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/idKPI")+"')/Results?";
				var filters = [new Filter("NODE", FilterOperator.EQ, this.PLANT)];
				var filter1=[new Filter("PGROUP" + (this.hierarchyLevel - 1) + "_ID",FilterOperator.EQ,this.forSearch[this.hierarchyLevel - 1])];
				filters.concat(filter1);
				this.lastFilters=filters;
				this.lastPath = path;
				this.tableBindItems(path,filters);
				var table = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
				var tRows = table.getRows();
				var data=[];
				for(var i=0; i<tRows.length; i++){
					var item = {};
					item.name = tRows[i].getCells()[1].getProperty("text");
					item.plan = tRows[i].getCells()[3].getProperty("text");
					item.fact = tRows[i].getCells()[2].getProperty("text");
					data.push(item);
				}
				this.setBarChart(data);
			}
			if(this.hierarchyLevel===1) {
				// var path = "plants>/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=PLANT eq " + this.PLANT;
				var tPath="/InputG" + this.hierarchyLevel + "(IP_DATE1='"+date1+"',IP_DATE2='"+date2+"',IP_DTYPE='"+sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/idKPI")+"')/Results?";
				var filters = [new Filter("NODE", sap.ui.model.FilterOperator.EQ, this.PLANT)];
				this.lastFilters=filters;
				this.lastPath = tPath;
				this.tableBindItems(tPath,filters);
				this.setPieChart();
			}
			if(this.hierarchyLevel === 0)
			{
				// var oBindingContext = oEvent.getSource().getBindingContext();
				// return new Promise(function(fnResolve) {
				// 	this.doNavigate("KPIPage", oBindingContext, fnResolve, "");
				// }.bind(this)).catch(function(err) {
				// 	if (err !== undefined) {
				// 		MessageBox.error(err.message);
				// 	}
				// });

				var NavC = this.getView().oParent.oParent.oParent.byId("pageContainer");
				NavC.backToPage("page4");
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
		fnApplyFiltersAndOrdering: function (oEvent){
			var aFilters = [], aSorters = [];

				if (this.bGrouped) {
					aSorters.push(new Sorter("SupplierName", this.bDescending, this._fnGroup));
				} else {
					aSorters.push(new Sorter("SUM", this.bDescending));
				}

			this.byId("sap_m_Page_0-content-build_simple_Table-1534593457799").getBinding("items").sort(aSorters);
		},
		handleConfirm1: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("sap_m_Page_0-content-build_simple_Table-1534593457799");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			var sPath;
			var bDescending;
			var aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},
		_onSort: function(oEvent) {

			if (!this._DialogSort) {
				this._DialogSort = sap.ui.xmlfragment("com.sap.build.standard.scopeCopy.view.ViewSettingsDialog1", this);
			}
            this._DialogSort.open();

		},
		updateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		getCustomFilter: function(sPath, vValueLT, vValueGT) {
			if (vValueLT !== "" && vValueGT !== "") {
				return new sap.ui.model.Filter([
					new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.GT, vValueGT),
					new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.LT, vValueLT)
				], true);
			}
			if (vValueLT !== "") {
				return new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.LT, vValueLT);
			}
			return new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.GT, vValueGT);

		},
		getCustomFilterString: function(bIsNumber, sPath, sOperator, vValueLT, vValueGT) {
			switch (sOperator) {
				case sap.ui.model.FilterOperator.LT:
					return sPath + (bIsNumber ? ' (Less than ' : ' (Before ') + vValueLT + ')';
				case sap.ui.model.FilterOperator.BT:
					return sPath + ' (Between ' + vValueGT + ' and ' + vValueLT + ')';
				case sap.ui.model.FilterOperator.GT:
					return sPath + (bIsNumber ? ' (More than ' : ' (After ') + vValueGT + ')';
			}

		},
		filterCountFormatter: function(sValue1, sValue2) {
			return sValue1 !== "" || sValue2 !== "" ? 1 : 0;

		},
		handleConfirm2: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
			var oBinding = oTable.getBinding("items");
			var oFilter = [];
			var vValueLT = sap.ui.core.Fragment.byId("filterFragment", "vValueLT").getValue();
			var vValueGT = sap.ui.core.Fragment.byId("filterFragment", "vValueGT").getValue();
			var tPath;
			var vCase;
			if(vValueLT !== "" && vValueGT !== ""){
				vCase = 1;
			} else if(vValueLT === "" && vValueGT === "") {
				vCase = 2;
			} else if (vValueLT !== "" && vValueGT === "") {
				vCase = 3;
			} else if (vValueLT === "" && vValueGT !== "") {
				vCase = 4;
			}
			if(this.hierarchyLevel===1) {
				switch(vCase) {
					case 1:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM ge " + vValueGT+" and SUM le "+vValueLT+" and PLANT eq "+this.PLANT+")";
						break;
					case 2:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(PLANT eq "+this.PLANT+")";
						break;
					case 3:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM le "+vValueLT+" and PLANT eq "+this.PLANT+")";
						break;
					case 4:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?&$filter=(SUM ge " + vValueGT+" and PLANT eq "+this.PLANT+")";
				}
			}
			else {
				switch(vCase) {
					case 1:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM ge " + vValueGT+" and SUM le "+vValueLT+" and PLANT eq "+this.PLANT+" and TG" + (this.hierarchyLevel - 1) + " eq '" + this.forSearch[this.hierarchyLevel - 1] + "')";
						break;
					case 2:
						tPath =	"/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(PLANT eq "+this.PLANT+" and TG" + (this.hierarchyLevel - 1) + " eq '" + this.forSearch[this.hierarchyLevel - 1] + "')";
						break;
					case 3:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM le "+vValueLT+" and PLANT eq "+this.PLANT+" and TG" + (this.hierarchyLevel - 1) + " eq '" + this.forSearch[this.hierarchyLevel - 1] + "')";
						break;
					case 4:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM ge " + vValueGT+" and PLANT eq "+this.PLANT+" and TG" + (this.hierarchyLevel - 1) + " eq '" + this.forSearch[this.hierarchyLevel - 1] + "')";
				}
			}
			this.lastPath = tPath;
			this.tableBindItems(tPath);
				// oTable.bindItems(tPath,
				// 	new sap.m.ColumnListItem( {
				// 	  type: "Active",
				// 	  press: this._onRowPress.bind(this),
				// 	  cells: [
				// 		  /*new sap.m.ObjectIdentifier({ text: "{plants>PLANT}" }),*/
				// 		  new sap.m.ObjectIdentifier({ text: "{plants>TG" + this.hierarchyLevel + "} " + "{plants>OBJ_TXT}" }),
				// 		  new sap.m.ObjectIdentifier({ text: "{plants>SUM}" })
				// 	  ]
				// 	})
				// );
		},
		_onFilter: function(oEvent) {
			if (!this._DialogFilter) {
				this._DialogFilter = sap.ui.xmlfragment("filterFragment","com.sap.build.standard.scopeCopy.view.ViewSettingsDialog2", this);
			}
			sap.ui.core.Fragment.byId("filterFragment", "vValueLT").setValue("");
			sap.ui.core.Fragment.byId("filterFragment", "vValueGT").setValue("");
            this._DialogFilter.open();
		},
		_onOverflowToolbarButtonPress2: function(oEvent) {
			console.log("onOverflowToolbarButtonPress2");
			this.mSettingsDialogs = this.mSettingsDialogs || {};
			var sSourceId = oEvent.getSource().getId();
			var oDialog = this.mSettingsDialogs["ViewSettingsDialog3"];

			var confirmHandler = function(oConfirmEvent) {
				var self = this;
				var sFilterString = oConfirmEvent.getParameter('filterString');
				var oBindingData = {};

				/* Grouping */
				if (oConfirmEvent.getParameter("groupItem")) {
					var sPath = oConfirmEvent.getParameter("groupItem").getKey();
					oBindingData.groupby = [new sap.ui.model.Sorter(sPath, oConfirmEvent.getParameter("groupDescending"), true)];
				} else {
					// Reset the group by
					oBindingData.groupby = null;
				}

				aCollections.forEach(function(oCollectionItem) {
					var oCollection = self.getView().byId(oCollectionItem.id);
					var oBindingInfo = oCollection.getBindingInfo(oCollectionItem.aggregation);
					var oBindingOptions = this.updateBindingOptions(oCollectionItem.id, oBindingData, sSourceId);
					if (oBindingInfo.model === "kpiModel") {
						oCollection.getObjectBinding().refresh();
					} else {
						oCollection.bindAggregation(oCollectionItem.aggregation, {
							model: oBindingInfo.model,
							path: oBindingInfo.path,
							parameters: oBindingInfo.parameters,
							template: oBindingInfo.template,
							templateShareable: true,
							sorter: oBindingOptions.sorters,
							filters: oBindingOptions.filters
						});
					}

					// Display the filter string if necessary
					if (typeof oCollection.getInfoToolbar === "function") {
						var oToolBar = oCollection.getInfoToolbar();
						if (oToolBar && oToolBar.getContent().length === 1) {
							oToolBar.setVisible(!!sFilterString);
							oToolBar.getContent()[0].setText(sFilterString);
						}
					}
				}, this);
			}.bind(this);

			function resetFiltersHandler() {

				oDialog.getModel().setProperty("/Sum/vValueLT", "");
				oDialog.getModel().setProperty("/Sum/vValueGT", "");

			}

			function updateDialogData(filters) {
				var mParams = {
					context: oReferenceCollection.getBindingContext(),
					success: function(oData) {
						var oJsonModelDialogData = {};
						// Loop through each entity
						oData.results.forEach(function(oEntity) {
							// Add the distinct properties in a map
							for (var oKey in oEntity) {
								if (!oJsonModelDialogData[oKey]) {
									oJsonModelDialogData[oKey] = [oEntity[oKey]];
								} else if (oJsonModelDialogData[oKey].indexOf(oEntity[oKey]) === -1) {
									oJsonModelDialogData[oKey].push(oEntity[oKey]);
								}
							}
						});

						var oDialogModel = oDialog.getModel();

						oJsonModelDialogData["Sum"] = {
							vValueLT: (oDialogModel && oDialogModel.getProperty("/Sum")) ? oDialogModel.getProperty("/Sum/vValueLT") : "",
							vValueGT: (oDialogModel && oDialogModel.getProperty("/Sum")) ? oDialogModel.getProperty("/Sum/vValueGT") : ""
						};

						if (!oDialogModel) {
							oDialogModel = new sap.ui.model.json.JSONModel();
							oDialog.setModel(oDialogModel);
						}
						oDialogModel.setData(oJsonModelDialogData);
						oDialog.open();
					}
				};
				var sPath;
				var sModelName = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).model;
				// In KPI mode for charts, getBindingInfo would return the local JSONModel
				if (sModelName === "kpiModel") {
					sPath = oReferenceCollection.getObjectBinding().getPath();
				} else {
					sPath = oReferenceCollection.getBindingInfo(aCollections[0].aggregation).path;
				}
				mParams.filters = filters;
				oModel.read(sPath, mParams);
			}

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment({
					fragmentName: "com.sap.build.standard.scopeCopy.view.ViewSettingsDialog3"
				}, this);
				oDialog.attachEvent("confirm", confirmHandler);
				oDialog.attachEvent("resetFilters", resetFiltersHandler);

				this.mSettingsDialogs["ViewSettingsDialog3"] = oDialog;
			}

			var aCollections = [];

			aCollections.push({
				id: "sap_m_Page_0-content-build_simple_Table-1534593457799",
				aggregation: "items"
			});

			var oReferenceCollection = this.getView().byId(aCollections[0].id);
			var oSourceBindingContext = oReferenceCollection.getBindingContext();
			var oModel = oSourceBindingContext ? oSourceBindingContext.getModel() : this.getView().getModel();

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
			var designTimeFilters = this.mBindingOptions && this.mBindingOptions[aCollections[0].id] && this.mBindingOptions[aCollections[0].id].filters && this.mBindingOptions[aCollections[0].id].filters[undefined];
			updateDialogData(designTimeFilters);

		},
		handleConfirm3: function(oEvent) {
			var oView = this.getView();
			var oTable = oView.byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");
			var sPath;
			var bDescending;
			var aSorters = [];
			var vValueLT = sap.ui.core.Fragment.byId("settingsFragment", "vValueLT").getValue();
			var vValueGT = sap.ui.core.Fragment.byId("settingsFragment", "vValueGT").getValue();
			var tPath;
			var vCase;
			if(vValueLT !== "" && vValueGT !== ""){
				vCase = 1;
			} else if(vValueLT === "" && vValueGT === "") {
				vCase = 2;
			} else if (vValueLT !== "" && vValueGT === "") {
				vCase = 3;
			} else if (vValueLT === "" && vValueGT !== "") {
				vCase = 4;
			}
			if(this.hierarchyLevel===1) {
				switch(vCase) {
					case 1:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM ge " + vValueGT+" and SUM le "+vValueLT+" and PLANT eq "+this.PLANT+")";
						break;
					case 2:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(PLANT eq "+this.PLANT+")";
						break;
					case 3:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM le "+vValueLT+" and PLANT eq "+this.PLANT+")";
						break;
					case 4:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM ge " + vValueGT+" and PLANT eq "+this.PLANT+")";
				}
			}
			else {
				switch(vCase) {
					case 1:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM ge " + vValueGT+" and SUM le "+vValueLT+" and PLANT eq "+this.PLANT+" and TG" + (this.hierarchyLevel - 1) + " eq '" + this.forSearch[this.hierarchyLevel - 1] + "')";
						break;
					case 2:
						tPath =	"/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(PLANT eq "+this.PLANT+" and TG" + (this.hierarchyLevel - 1) + " eq '" + this.forSearch[this.hierarchyLevel - 1] + "')";
						break;
					case 3:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM le "+vValueLT+" and PLANT eq "+this.PLANT+" and TG" + (this.hierarchyLevel - 1) + " eq '" + this.forSearch[this.hierarchyLevel - 1] + "')";
						break;
					case 4:
						tPath = "/VIEW_MATGR" + this.hierarchyLevel + "_07_08?$filter=(SUM ge " + vValueGT+" and PLANT eq "+this.PLANT+" and TG" + (this.hierarchyLevel - 1) + " eq '" + this.forSearch[this.hierarchyLevel - 1] + "')";
				}
			}
			this.lastPath = tPath;
			this.tableBindItems(tPath);
				// oTable.bindItems(tPath,
				// 	new sap.m.ColumnListItem( {
				// 	  type: "Active",
				// 	  press: this._onRowPress.bind(this),
				// 	  cells: [
				// 		  /*new sap.m.ObjectIdentifier({ text: "{plants>PLANT}" }),*/
				// 		  new sap.m.ObjectIdentifier({ text: "{plants>TG" + this.hierarchyLevel + "} " + "{plants>OBJ_TXT}" }),
				// 		  new sap.m.ObjectIdentifier({ text: "{plants>SUM}" })
				// 	  ]
				// 	})
				// );
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			console.log(bDescending);
			console.log(sPath);
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},
		_onSettings: function(oEvent) {

			if (!this._DialogSettings) {
			this._DialogSettings = sap.ui.xmlfragment("settingsFragment","com.sap.build.standard.scopeCopy.view.ViewSettingsDialog4", this);
			}
            this._DialogSettings.open();
		},
		_onRowPress: function(oEvent,date1,date2) {
			if (!date1) {
				date1="20171107";
				date2="20171108";
			}
				//var oTable = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
				//this.forSearch[this.hierarchyLevel] = oEvent.getSource().mAggregations.cells[1].mProperties.title;
				var chartTitle;
				switch(this.hierarchyLevel) {
					case 1:
						this.forSearch[this.hierarchyLevel] = oEvent.getSource().getBindingContext().getObject().PGROUP1_ID;
						chartTitle = oEvent.getSource().getBindingContext().getObject().PGROUP1__TXTMD;
						break;
					case 2:
						this.forSearch[this.hierarchyLevel] = oEvent.getSource().getBindingContext().getObject().PGROUP2_ID;
						chartTitle = oEvent.getSource().getBindingContext().getObject().PGROUP2__TXTMD;
						break;
					case 3:
						this.forSearch[this.hierarchyLevel] = oEvent.getSource().getBindingContext().getObject().PGROUP3_ID;
						chartTitle = oEvent.getSource().getBindingContext().getObject().PGROUP3__TXTMD;
						break;
					case 4:
						this.forSearch[this.hierarchyLevel] = oEvent.getSource().getBindingContext().getObject().PGROUP4_ID;
						chartTitle = oEvent.getSource().getBindingContext().getObject().PGROUP4__TXTMD;
						break;
					case 5:
						//chartTitle = oEvent.getSource().getBindingContext().getObject().PRODUCT__TXTMD;
						return;
				}

				this.forTitle[this.hierarchyLevel] = chartTitle;
				//oEvent.getSource().oBindingContexts.plants.sPath;
				//var rowItem = (oEvent.getParameter("data") || oEvent.getSource()).oBindingContexts.plants.oModel;


				this.hierarchyLevel++;
				var oTable = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
				oTable.unbindRows();
				var level = this.hierarchyLevel - 1;
				var id = "idPrGr" + level;
				this.getView().byId(id).setVisible(true);
				this.getView().byId(id).setText(this.getView().byId("idBreadCrumb").getCurrentLocationText());
				this.getView().byId("idBreadCrumb").setCurrentLocationText(chartTitle);
				var path="/InputG" + this.hierarchyLevel + "(IP_DATE1='"+date1+"',IP_DATE2='"+date2+"',IP_DTYPE='"+sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/idKPI")+"')/Results?";
				var filters = [new Filter("NODE", FilterOperator.EQ, this.PLANT)];
				var filter1=[new Filter("PGROUP" + (this.hierarchyLevel - 1) + "_ID",FilterOperator.EQ,this.forSearch[this.hierarchyLevel - 1])];
				filters.concat(filter1);
				this.lastFilters=filters;
				this.lastPath = path;
				this.tableBindItems(path,filters);
				// console.log(this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799").getRows()[0].getCells());
				// var table = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
				// var tRows = table.getRows();
				// var data=[];
				// for(var i=0; i<tRows.length; i++){
				// 	var item = {};
				// 	item.name = tRows[i].getCells()[1].getProperty("text");
				// 	item.plan = tRows[i].getCells()[3].getProperty("text");
				// 	item.fact = tRows[i].getCells()[2].getProperty("text");
				// 	data.push(item);
				// }
				// this.setBarChart(data);
		},

		_onSearchFieldLiveChange: function(oEvent) {

			// Get the search query, regardless of the triggered event ('query' for the search event, 'newValue' for the liveChange one).
			var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");

			var table = this.byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
			var aFilters = [];
			var txtFilter=new Filter("PGROUP"+this.hierarchyLevel+"__TXTMD", sap.ui.model.FilterOperator.Contains, sQuery);;
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter({
				    filters: [
				      txtFilter
				    ],
				    and: false
				  });
				aFilters.push(filter);
				var binding = table.getBinding("rows");
				binding.filter(aFilters);
			}
			else {
				this.tableBindItems(this.lastPath,this.lastFilters);
			}

		},
		formatDateUTCtoLocale: function(dDate) {
			if (dDate) {
				return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
			}
			return dDate;

		},
		_linkVisible: function(){
			this.getView().byId("idPrGr1").setVisible(false);
			this.getView().byId("idPrGr2").setVisible(false);
			this.getView().byId("idPrGr3").setVisible(false);
			this.getView().byId("idPrGr4").setVisible(false);
		},
		_onLinkPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();
			this._linkVisible();

			var NavC = this.getView().oParent.oParent.oParent.byId("pageContainer");

			NavC.backToPage("pageKPI");
			// return new Promise(function(fnResolve) {
			// 	this.doNavigate("PlantsPage", oBindingContext, fnResolve, "");
			// }.bind(this)).catch(function(err) {
			// 	if (err !== undefined) {
			// 		MessageBox.error(err.message);
			// 	}
			// });

		},
		_onLinkPress1: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();
			this._linkVisible();

			var NavC = this.getView().oParent.oParent.oParent.byId("pageContainer");
			NavC.backToPage("page4");
			//}
			// return new Promise(function(fnResolve) {
			// 	this.doNavigate("KPIPage", oBindingContext, fnResolve, "");
			// }.bind(this)).catch(function(err) {
			// 	if (err !== undefined) {
			// 		MessageBox.error(err.message);
			// 	}
			// });

		},
		avatarInitialsFormatter: function(sTextValue) {
			return typeof sTextValue === 'string' ? sTextValue.substr(0, 2) : undefined;

		},
		applyFiltersAndSorters: function(sControlId, sAggregationName) {
			var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		createFiltersAndSorters: function() {
			this.mBindingOptions = {};
			var oBindingData, aPropertyFilters;
			oBindingData = {};
			oBindingData.sorters = [];

			oBindingData.sorters.push(new sap.ui.model.Sorter("Sum", false, false));
			oBindingData.groupby = [new sap.ui.model.Sorter("Name", false, true)];

			this.updateBindingOptions("sap_m_Page_0-content-sap_chart_PieChart-1534514715733", oBindingData);

		},

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getView().addEventDelegate({
        		onBeforeShow: function(evt) {
            		evt.to.getController().handleRouteMatched();
            		evt.to.getViewData()(evt.to);
        		}
    		});
			this.PLANT = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/Plant");
			this.hierarchyLevel = 1;
			this.forSearch = [];
			this.forTitle = [];
			this.bGrouped = false;
			this.bDescending = false;

			this.mAggregationBindingOptions = {};
			this.createFiltersAndSorters();

			var dayDate1 = new Date(2017, 10, 7);
			var dayDate2 = new Date(2017, 10, 8);
			this.getView().byId("DP1").setDateValue(dayDate1);
			this.getView().byId("DP2").setDateValue(dayDate2);

		},
		getTable : function(){
			return this.byId("page5Table");
		},

		renderTable: function(){
			var oTable = this.getTable();
			var oControl = new sap.ui.commons.TextField().bindProperty("value", "OBJ_KEY");

			oTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({text:"OBJ_KEY"}),
				template :oControl,
				sortProperty :"OBJ_KEY",
				filterProperty :"OBJ_KEY",
				width :"10%"
			}));

	      oControl = new sap.ui.commons.TextField().bindProperty("value", "OBJ_TXT");

	      oTable.addColumn(new sap.ui.table.Column({
		      label: new sap.ui.commons.Label({text:"OBJ_TXT"}),
		      template :oControl,
		      sortProperty :"OBJ_TXT",
		      filterProperty :"OBJ_TXT",
		      width :"40%"
		      }));
	      oTable.setModel(this.oModel, "data");
	      var oSorter = new sap.ui.model.Sorter("OBJ_KEY");
	      oTable.bindRows("/MATGR1", oSorter);
		},

		initBindingEventHandler : function(){
			var oTable = this.byId("sap_m_Page_0-content-build_simple_Table-1534593457799");
			var oBinding = oTable.getBinding("rows");


			oBinding.attachDataReceived(function(){
				oTable.setNoData(null); //Use default again ("No Data" in case no data is available)
			});
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
			this.handleChange();
			this.refreshData();
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
			this.handleChange();
			this.refreshData();
		},
		onAfterRendering: function() {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			//var count = this.getView().byId("sap_m_Page_0-content-build_simple_Table-1534593457799").getRows().length;
			//var size = count * this.getView().byId("fbTableContent").getHeight();
			//this.getView().byId("idbarchart").setHeight(size + "px");
		},

		setColumnLabel: function(value) {
			if(value/1000<100) {
				return 1;
			} else if(value/1000<1000) {
				return 1000;
			} else if (value/1000000 <1000) {
				return 1000;
			} else if (value/1000000 <10000) {
				return 1000000;
			} else {
				return 1000000000;
			}
		}
	});
}, /* bExport= */ true);

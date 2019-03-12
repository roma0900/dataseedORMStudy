sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter"
], function(BaseController, MessageBox, Utilities, History, Filter) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.scopeCopy.controller.KPIPage", {


		handleRouteMatched: function(date1,date2) {
			if (!date1) {
				date1="20171107";
				date2="20171108";
			}
			//var oParams = {};
			console.log(this);
			var data = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/shopAddress");
			var plant = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/Plant");
			//this.getView().byId("idShop").setText(data);
			this.getView().byId("breadcrumbs").setCurrentLocationText(data);
			//var oModel = this.getOwnerComponent().getModel("plants");
			var oModel = this.getView().getModel("third");
			var path = "/InputSH(IP_DATE1='"+date1+"',IP_DATE2='"+date2+"')/Results?";
			var filter = new Filter("NODE", sap.ui.model.FilterOperator.EQ, plant);
			var filters=[];
			filters.push(filter);
			var tileRTO = this.getView().byId("RTOvalue");
			var tileRemains = this.getView().byId("Remainsvalue");
			var tileSpisaniya = this.getView().byId("WOffvalue");
			var tilePlanDo = this.getView().byId("Planvalue");
			var tileSred = this.getView().byId("AvCheckvalue");
			var tileTrafic = this.getView().byId("Trafficvalue");
			var this1 = this;
			var oResourseBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			//var oResourseBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			oModel.read(path, {filters:filters, async : false, success:
				function(oData, oResponse) {
					var data=oData.results;
					console.log(data);
					tileRTO.setValue(data[0].RTO_AMOUNT_1/this1.setTileSubheader(this1.getView().byId("tileRTO"),data[0].RTO_AMOUNT_1,oResourseBundle));
					tileRemains.setValue(data[0].STOCK_AMOUNT_1/this1.setTileSubheader(this1.getView().byId("tileRemains"),data[0].STOCK_AMOUNT_1,oResourseBundle));
					tileSpisaniya.setValue(data[0].MOVE_AMOUNT_1/this1.setTileSubheader(this1.getView().byId("tileWriteOff"),data[0].MOVE_AMOUNT_1,oResourseBundle));
					tilePlanDo.setValue(data[0].KPI_PLAN_COMPL_1);
					tileSred.setValue(data[0].KPI_PLAN_AVG_1);
					tileTrafic.setValue(data[0].KPI_TRAFFIC_1);
					this1.addTileClass(this1.getView().byId("tileRTO"), data[0].RTO_ICON);
					this1.addTileClass(this1.getView().byId("tileRemains"), data[0].STOCK_ICON);
					this1.addTileClass(this1.getView().byId("tileWriteOff"), data[0].MOVE_ICON);
					this1.addTileClass(this1.getView().byId("tilePlan"), data[0].KPI_PLAN_ICON);
					this1.addTileClass(this1.getView().byId("tileAvCheck"), data[0].KPI_PLAN_AVG__ICON);
					this1.addTileClass(this1.getView().byId("tileTraffic"), data[0].KPI_TRAFFIC_ICON);
				}});
		},
		setTileSubheader: function(tile, value,oResourseBundle) {
			if(value/1000<1000) {
				tile.setSubheader(oResourseBundle.getText("kRub"));
				return 1000;
			} else if (value/1000000 <1000) {
				tile.setSubheader(oResourseBundle.getText("mRub"));
				return 1000000;
			} else {
				tile.setSubheader(oResourseBundle.getText("bRub"));
				return 1000000000;
			}
		},
		addTileClass: function(tile, param1) {
			var tileClass = this.tileState(param1);
			tile.removeStyleClass("tileLayout");
			tile.removeStyleClass("tileLayout1");
			tile.removeStyleClass("tileLayout2");
			tile.addStyleClass(tileClass);
		},
		refreshData: function(){
			var Date1  = this.getView().byId("DP1").getDateValue();
			var Date2  = this.getView().byId("DP2").getDateValue();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYYMMdd" });
			var dd = dateFormat.format(Date1);
			var dd2 = dateFormat.format(Date2);
			this.handleRouteMatched(dd,dd2);
		},
		_onPageNavButtonPress: function(oEvent) {

			// var oBindingContext = oEvent.getSource().getBindingContext();

			// return new Promise(function(fnResolve) {

			// 	this.doNavigate("PlantsPage", oBindingContext, fnResolve, "");
			// }.bind(this)).catch(function(err) {
			// 	if (err !== undefined) {
			// 		MessageBox.error(err.message);
			// 	}
			// });
			var NavC = this.getView().oParent.oParent.oParent.byId("pageContainer");
			NavC.backToPage("pageKPI");

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
		_onRTOTilePress: function(oEvent) {
			var textFromTile = this.getView().byId("tileRTO").getHeader();
			this._onGenericTilePressNavigation(textFromTile,"RTO");
		},
		_onRemainsTilePress: function(oEvent) {
			var textFromTile = this.getView().byId("tileRemains").getHeader();
			this._onGenericTilePressNavigation(textFromTile,"Stock");
		},
		_onWriteOffTilePress: function(oEvent) {
			var textFromTile = this.getView().byId("tileWriteOff").getHeader();
			this._onGenericTilePressNavigation(textFromTile,"Move");
		},
		_onGenericTilePress3: function(oEvent) {
			var textFromTile = this.getView().byId("tilePlan").getHeader();
			this._onGenericTilePressNavigation(textFromTile);
		},
		_onGenericTilePress4: function(oEvent) {
			var textFromTile = this.getView().byId("tileAvCheck").getHeader();
			this._onGenericTilePressNavigation(textFromTile);
		},
		_onGenericTilePress5: function(oEvent) {
			var textFromTile = this.getView().byId("tileTraffic").getHeader();
			this._onGenericTilePressNavigation(textFromTile);
		},

		_onGenericTilePressNavigation: function(textFromTile, idKPI) {
			//var oBindingContext = oEvent.getSource().getBindingContext();
			var json = {};
			json.KPI = textFromTile;
			json.idKPI=idKPI;
			json.shopAddress = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/shopAddress");
			json.Plant = sap.ui.getCore().getModel("Modelbreadcrumbs").getProperty("/Plant");
			sap.ui.getCore().getModel("Modelbreadcrumbs").setData(json);

			var NavC = this.getView().oParent.oParent.oParent.byId("pageContainer");

			if(NavC.getPage("pageRTO")===null){
				var pageRTO = sap.ui.view("pageRTO",{id:"application-BUILD-prototype-component---TGDetailPage",
				viewName:"com.sap.build.standard.scopeCopy.view.TGDetailPage",
				type:sap.ui.core.mvc.ViewType.XML});
				NavC.addPage(pageRTO);
				pageRTO.oViewData = this.getView().getViewData();
				NavC.to("pageRTO");
			}
			else{
				NavC.to("pageRTO");
			}

			// return new Promise(function(fnResolve) {
			// 	this.doNavigate("TGDetailPage", oBindingContext, fnResolve, "");
			// }.bind(this)).catch(function(err) {
			// 	if (err !== undefined) {
			// 		MessageBox.error(err.message);
			// 	}
			// });
		},
		formatDateUTCtoLocale: function(dDate) {
			if (dDate) {
				return new Date(dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate());
			}
			return dDate;

		},
		_onLinkPress: function(oEvent) {

			// var oBindingContext = oEvent.getSource().getBindingContext();

			// return new Promise(function(fnResolve) {

			// 	this.doNavigate("PlantsPage", oBindingContext, fnResolve, "");
			// }.bind(this)).catch(function(err) {
			// 	if (err !== undefined) {
			// 		MessageBox.error(err.message);
			// 	}
			// });
			var NavC = this.getView().oParent.oParent.oParent.byId("pageContainer");
			NavC.backToPage("pageKPI");

		},
		avatarInitialsFormatter: function(sTextValue) {
			return typeof sTextValue === 'string' ? sTextValue.substr(0, 2) : undefined;

		},
		onInit: function() {
			// this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.getTarget("KPIPage").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var dayDate1 = new Date(2017, 10, 7);
			var dayDate2 = new Date(2017, 10, 8);
			this.getView().byId("DP1").setDateValue(dayDate1);
			this.getView().byId("DP2").setDateValue(dayDate2);
			this.getView().addEventDelegate({
				   onBeforeShow: function(evt) {
				   		evt.to.getController().handleRouteMatched();
				   		console.log(evt.to);
				   		evt.to.getViewData()(evt.to);
				   }
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
		tileState: function(param) {
			if(param>90) {
				return "tileLayout2";
			} else if(param >70) {
				return "tileLayout1";
			} else {
				return "tileLayout";
			}
		}

	});
}, /* bExport= */ true);

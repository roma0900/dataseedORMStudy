sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, MessageBox, Utilities, History, Filter) {
	"use strict";
	
	
	return BaseController.extend("com.sap.build.standard.scopeCopy.controller.PageSideNav", {
		
		
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
		onSideNavButtonPress: function() {
			var toolPage = this.getView().byId("toolPageId");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
		onItemSelect : function(oEvent) {
			var oNavContainer = this.getView().byId("pageContainer");
			//this.NavConFrom = {};
			var this1=this;
			var item = oEvent.getParameter("item");
			var pageTitle = this.getView().byId("pageTitle");
			switch(item.getKey()){
				case "page6":
					pageTitle.setText(item.getText());
					if(oNavContainer.getPage("page6")===null){
						var page6 = sap.ui.view("page6",{id:"application-BUILD-prototype-component---ParamsPage", 
						viewName:"com.sap.build.standard.scopeCopy.view.ParamsPage", 
						type:sap.ui.core.mvc.ViewType.XML});
						page6.oViewData = this.handleFromKPIPage;
						oNavContainer.addPage(page6);
					}
					oNavContainer.to("page6");
					break;
				case "pageKPI":
					pageTitle.setText(item.getText());
					oNavContainer.backToPage("pageKPI");
					break;
				case "users":
					pageTitle.setText(item.getText());
					if(oNavContainer.getPage("users")===null){
						this.users = sap.ui.view("users",{id:"application-BUILD-prototype-component---PageUsers", 
						viewName:"com.sap.build.standard.scopeCopy.view.PageUsers", 
						type:sap.ui.core.mvc.ViewType.XML});
						this.users.oViewData = this.handleFromKPIPage;
						oNavContainer.addPage(this.users);
					}
					oNavContainer.to("users");
					break;
				case "dictionary":
					pageTitle.setText(item.getText());
					if(oNavContainer.getPage("dictionary")===null){
						var dictionary = sap.ui.view("dictionary",{id:"application-BUILD-prototype-component---DictionaryPage", 
						viewName:"com.sap.build.standard.scopeCopy.view.Dictionary", 
						type:sap.ui.core.mvc.ViewType.XML});
						dictionary.oViewData = this.handleFromKPIPage;
						oNavContainer.addPage(dictionary);
					}
					oNavContainer.to("dictionary");
					break;
				case "roles":
					pageTitle.setText(item.getText());
					if(oNavContainer.getPage("roles")===null){
						this.roles = sap.ui.view("roles",{id:"application-BUILD-prototype-component---RolesPage", 
						viewName:"com.sap.build.standard.scopeCopy.view.RolesPage", 
						type:sap.ui.core.mvc.ViewType.XML});
						this.roles.oViewData = this.handleFromKPIPage;
						oNavContainer.addPage(this.roles);
					}
					oNavContainer.to("roles");
					break;	
				case "pageHistorical":
					pageTitle.setText(item.getText());
					if(oNavContainer.getPage("pageHistorical")===null){
						this.pageHistorical = sap.ui.view("pageHistorical",{id:"application-BUILD-prototype-component---HistoricalDataPage", 
						viewName:"com.sap.build.standard.scopeCopy.view.HistoricalDataPage", 
						type:sap.ui.core.mvc.ViewType.XML});
						this.pageHistorical.oViewData = this.handleFromKPIPage;
						oNavContainer.addPage(this.pageHistorical);
					}
					oNavContainer.to("pageHistorical");
					break;
				case "PersonalSettings":
					pageTitle.setText(item.getText());
					if(oNavContainer.getPage("PersonalSettings")===null){
						this.PersonalSettings = sap.ui.view("PersonalSettings",{id:"application-BUILD-prototype-component---PersonalSettingsPage", 
						viewName:"com.sap.build.standard.scopeCopy.view.PersonalSettingsPage", 
						type:sap.ui.core.mvc.ViewType.XML});
						this.PersonalSettings.oViewData = this.handleFromKPIPage;
						oNavContainer.addPage(this.PersonalSettings);
					}
					oNavContainer.to("PersonalSettings");
					break;	
				case "pagePrognosis":
					pageTitle.setText(item.getText());
					if(oNavContainer.getPage("pagePrognosis")===null){
						this.pagePrognosis = sap.ui.view("pagePrognosis",{id:"application-BUILD-prototype-component---PrognosisPage", 
						viewName:"com.sap.build.standard.scopeCopy.view.PrognosisPage", 
						type:sap.ui.core.mvc.ViewType.XML});
						this.pagePrognosis.oViewData = this.handleFromKPIPage;
						oNavContainer.addPage(this.pagePrognosis);
					}
					oNavContainer.to("pagePrognosis");
					break;
				
				default:
					log.error("Undefined key"+item.getKey());
					
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

		onInit: function() {
			jQuery.ajax({
				type: "GET",
				url:"/services/userapi/currentUser"
			});
			//this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//this.oRouter.getTarget("PageSideNav").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var toolPage = this.getView().byId("toolPageId");
			sap.ui.getCore().setModel(this.getOwnerComponent().getModel("i18n"), "i18n");
			toolPage.setSideExpanded(false);
			var oNavContainer = this.getView().byId("pageContainer");
			if(Utilities.checkAdminUserRole(this)===true){
				var navigationPanel = this.getView().byId("sideNavigation");
				navigationPanel.setItem(this.addItemForNavigation(navigationPanel.getItem()));
			}
			sap.ui.getCore().NavCon = oNavContainer;
			sap.ui.getCore().setModel(this.getOwnerComponent().getModel("plants"), "plants");
			sap.ui.getCore().setModel(this.getOwnerComponent().getModel("userData"), "userData");
			sap.ui.getCore().setModel(this.getOwnerComponent().getModel("userRole"), "userRole");
			var Pages = {};
			this.getView().oViewData = Pages;
			if(oNavContainer.getPage("pageKPI")===null){
				this.pageKPI = sap.ui.view("pageKPI",{id:"application-BUILD-prototype-component---PlantsPage", 
				viewName:"com.sap.build.standard.scopeCopy.view.PlantsPage", 
				type:sap.ui.core.mvc.ViewType.XML});
				this.pageKPI.oViewData = this.handleFromKPIPage;
				oNavContainer.addPage(this.pageKPI);
			}
		
		},
		handleFromKPIPage: function(page){
			page.oParent.oParent.oParent.getViewData().fromPage = page;
		},
		
		
		/**
		 * Добавляет вкладки для администратора
		 * 
		 * @param items - item панели навигации.
		 */
		addItemForNavigation:function(items){
			var itemAdminSetting = new sap.tnt.NavigationListItem({
				icon:'sap-icon://settings',
				text: "{i18n>Settings}"
			});
			itemAdminSetting.addItem(
				new sap.tnt.NavigationListItem({
					icon:'sap-icon://money-bills',
					text: "{i18n>Cashbox}",
					key:'pageCashbox'
				})
			);
			itemAdminSetting.addItem(
				new sap.tnt.NavigationListItem({
					icon:'sap-icon://history',
					text: "{i18n>Historical}",
					key:'pageHistorical'
				})
			);
			items.addItem(itemAdminSetting);
			var authNavigateItem = new sap.tnt.NavigationListItem({
				icon:'sap-icon://business-card',
				text: "{i18n>Autorization}"
			});
			authNavigateItem.addItem(
				new sap.tnt.NavigationListItem({
					icon:'sap-icon://add-employee',
					text: "{i18n>Users}",
					key:'users'
				})
			);
			authNavigateItem.addItem(
				new sap.tnt.NavigationListItem({
					icon:'sap-icon://role',
					text: "{i18n>Roles}",
					key:'roles'
				})
			);
			items.addItem(authNavigateItem);
			return items;
		},
		
		handleLogout: function(){
			sap.m.URLHelper.redirect("/logout.html", false);
			// jQuery.ajax({
			// 	type: "GET",
			// 	url:"/services/userapi/logout"
			// });
		}

	});
	
	
}, /* bExport= */ true);
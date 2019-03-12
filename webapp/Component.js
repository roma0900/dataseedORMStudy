sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/sap/build/standard/scopeCopy/model/models",
	"sap/ui/model/odata/v2/ODataModel",
	"./model/errorHandling"
], function(UIComponent, Device, models,ODataModel, errorHandling) {
	"use strict";

	var navigationWithContext = {
		"dataSet": {
			"ParamsPage": ""
		}
	};

	return UIComponent.extend("com.sap.build.standard.scopeCopy.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");


			this.setModel(models.createUserModel(), "userData");
			
			this.setModel(models.createUserRoleModel(),"userRole");
			// set the dataSource model
			// var oModel = new sap.ui.model.odata.ODataModel('https://test1af0002a80.hana.ondemand.com/XSPROJECT/OData1.xsodata', true, null, null, {Authorization: "Basic UkJVTFlDSEVWOlJvbWEwOTAwIUAj"});
   //         this.setModel(oModel, "plants");
			// this.setModel(
   //             new ODataModel('https://test1af0002a80.hana.ondemand.com/XSPROJECT/OData1.xsodata', {
   //                 json : true,
   //                 useBatch : true,
   //                 user:"RBULYCHEV",
   //                 password:"Roma0900!@#",
   //                 headers:{
   //                 	Authorization: "Basic UkJVTFlDSEVWOlJvbWEwOTAwIUAj"
   //                 },
   //                 tokenHandling:false,
   //                 withCredentials:true
   //             }),"plants");
			// set application model
			var oApplicationModel = new sap.ui.model.json.JSONModel({});
			this.setModel(oApplicationModel, "applicationModel");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// delegate error handling
			errorHandling.register(this);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		createContent: function() {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},

		getNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}

	});

});

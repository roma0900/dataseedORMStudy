sap.ui.define([
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device"
	], function (JSONModel, Device) {
		"use strict";

		return {
			createDeviceModel : function () {
				var oModel = new JSONModel(Device);
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			},

			createFLPModel : function () {
				var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
					bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
					oModel = new JSONModel({
						isShareInJamActive: bIsShareInJamActive
					});
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			},
			
			createUserModel: function () {
				var oModel = new JSONModel("/services/userapi/currentUser");
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			},
			
			createUserRoleModel:function(){
				var oModel = new JSONModel("/api/projects/roles");
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			}, 
			createMyModel: function() {
				var oModel = new JSONModel();
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			}
		};

	}
);
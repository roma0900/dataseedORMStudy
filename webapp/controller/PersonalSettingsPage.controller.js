sap.ui.define([
	"sap/ui/core/mvc/Controller","sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";
	var selectedUserId;
	return Controller.extend("com.sap.build.standard.scopeCopy.controller.PersonalSettingsPage", {
		
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sap.build.standard.scopeCopy.view.PersonalSettingsPage
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.sap.build.standard.scopeCopy.view.PersonalSettingsPage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.sap.build.standard.scopeCopy.view.PersonalSettingsPage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.sap.build.standard.scopeCopy.view.PersonalSettingsPage
		 */
		//	onExit: function() {
		//
		//	}
		onSelectionChange: function(oEvent){
			var selectedItem = oEvent.getParameters().item.mProperties.key;
			var navCon = this.byId("PSNavCon");
			navCon.to(this.byId(selectedItem));
		},
		userNameFormatter: function(f,i,o){
			return f+" "+i+" "+o;
		},
		comboBoxChanged: function(oEvent){
			selectedUserId = oEvent.getSource().mProperties.selectedKey;
			var path = "USERS?$filter=ID eq "+selectedUserId;
			var oModel = sap.ui.getCore().getModel("plants");
			var inputGreen = this.byId("inputGreen");
			var inputYellow = this.byId("inputYellow");
			var inputRed = this.byId("inputRed");
			oModel.read(path, null, [], true, 
			function(oData, oResponse) {
				var data=oData.results;
				inputGreen.setValue(data[0].GREEN_LVL);
				inputYellow.setValue(data[0].YELLOW_LVL);
				inputRed.setValue("< "+data[0].YELLOW_LVL);
			});
		},
		onSetDefault: function(){
			this.byId("inputGreen").setValue(100);
			this.byId("inputYellow").setValue(80);
			this.byId("inputRed").setValue("< 80");
		},
		onSaveChanges: function(){
			var oEntry = {};
			var oModel = sap.ui.getCore().getModel("plants");
			var greenLvl = this.byId("inputGreen").getValue();
			var yellowLvl = this.byId("inputYellow").getValue();
			if(parseFloat(greenLvl)<=parseFloat(yellowLvl)){
				MessageBox.alert("Значение для зеленого статуса должно быть больше значения для желтого!");
			}
			else{
				oModel.read("USERS?$filter=ID eq "+selectedUserId, null, [], true, 
				function(oData, oResponse) {
					oEntry=oData.results[0];
					oEntry.GREEN_LVL = greenLvl;
					oEntry.YELLOW_LVL = yellowLvl;
					oModel.update("/USERS(" + oEntry.ID + ")", oEntry, null, function(){
						jQuery.sap.require("sap.ui.commons.MessageBox");
						MessageBox.show(
							"Настройки успешно изменены", {
								icon: sap.m.MessageBox.Icon.SUCCESS,
								title: "Изменение настроек",
								actions: sap.m.MessageBox.Action.OK
							}
						);
				 	},function(){
						jQuery.sap.require("sap.ui.commons.MessageBox");
						MessageBox.show(
							"Настройки не изменены", {
								icon: sap.m.MessageBox.Icon.WARNING,
								title: "Что-то пошло не так",
								actions: sap.m.MessageBox.Action.OK
							}
						);
				 	});
				});
			}
		},
		inputYellowLiveChange: function(oEvent){
			var newValue = oEvent.getParameter("value");
			this.byId("inputRed").setValue("< "+newValue);
		}

	});

});
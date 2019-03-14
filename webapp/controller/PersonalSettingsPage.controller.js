sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/m/MessageBox"
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
		onSelectionChange: function(oEvent) {
			var selectedItem = oEvent.getParameters().item.mProperties.key;
			var navCon = this.byId("PSNavCon");
			navCon.to(this.byId(selectedItem));
			var oStorage=jQuery.sap.storage(jQuery.sap.storage.Type.local);
			
			var green_clr=jQuery.sap.storage(jQuery.sap.storage.Type.local).get("KPIRemains-green");
			var yellow_clr=jQuery.sap.storage(jQuery.sap.storage.Type.local).get("KPIRemains-yellow");
			var green_clr1=jQuery.sap.storage(jQuery.sap.storage.Type.local).get("KPIWrite-offs-green");
			var yellow_clr1=jQuery.sap.storage(jQuery.sap.storage.Type.local).get("KPIWrite-offs-yellow");
			var green_clr2=jQuery.sap.storage(jQuery.sap.storage.Type.local).get("KPIRTO-green");
			var yellow_clr2=jQuery.sap.storage(jQuery.sap.storage.Type.local).get("KPIRTO-yellow");
			
			if (green_clr==null || yellow_clr==null) {
			oStorage.put("KPIWrite-offs-green",  100);
			oStorage.put("KPIWrite-offs-yellow",  80);
			}
			if (green_clr1==null || yellow_clr1==null) {
			oStorage.put("KPIRTO-green",  100);
			oStorage.put("KPIRTO-yellow",  80);
			}
			if (green_clr2==null || yellow_clr2==null) {
			oStorage.put("KPIRemains-green",  100);
			oStorage.put("KPIRemains-yellow",  80);
			}
		},
		userNameFormatter: function(f, i, o) {
			return f + " " + i + " " + o;
		},
		
		comboBoxChanged: function(oEvent) {
			var oStorage=jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var ComboBoxKey= oEvent.getSource().mProperties.selectedKey;
			switch (ComboBoxKey) {
				case "1": 
					var greenLvl=oStorage.get("KPIWrite-offs-green");
					var yellowLvl=oStorage.get("KPIWrite-offs-yellow");
					this.byId("inputGreen").setValue(greenLvl);
					this.byId("inputYellow").setValue(yellowLvl);
					this.byId("inputRed").setValue("< "+yellowLvl);
				break;
				case "2":
					var greenLvl1=oStorage.get("KPIRTO-green");
					var yellowLvl1=oStorage.get("KPIRTO-yellow");
					this.byId("inputGreen").setValue(greenLvl1);
					this.byId("inputYellow").setValue(yellowLvl1);
					this.byId("inputRed").setValue("< "+yellowLvl1);
				break;
				case "3":
					var greenLvl2=oStorage.get("KPIRemains-green");
					var yellowLvl2=oStorage.get("KPIRemains-yellow");	
					this.byId("inputGreen").setValue(greenLvl2);
					this.byId("inputYellow").setValue(yellowLvl2);
					this.byId("inputRed").setValue("< "+yellowLvl2);
				break;
			}

		/*	selectedUserId = oEvent.getSource().mProperties.selectedKey;
			var path = "USERS?$filter=ID eq " + selectedUserId;
			var oModel = sap.ui.getCore().getModel("plants");
			var inputGreen = this.byId("inputGreen");
			var inputYellow = this.byId("inputYellow");
			var inputRed = this.byId("inputRed");
			oModel.read(path, null, [], true,
				function(oData, oResponse) {
					var data = oData.results;
					inputGreen.setValue(data[0].GREEN_LVL);
					inputYellow.setValue(data[0].YELLOW_LVL);
					inputRed.setValue("< " + data[0].YELLOW_LVL);

				});*/
		},
		onSetDefault: function() {
			var oStorage=jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var greenLvl=100;
			var yellowLvl=80;
			var ComboBoxKey= this.getView().byId("ComboBox").mProperties.selectedKey;
			switch (ComboBoxKey) {
				case "1": 
					oStorage.put("KPIWrite-offs-green",  greenLvl);
					oStorage.put("KPIWrite-offs-yellow",  yellowLvl);
					this.byId("inputGreen").setValue(100);
					this.byId("inputYellow").setValue(80);
					this.byId("inputRed").setValue("< 80");
				break;
				case "2":
					oStorage.put("KPIRTO-green",  greenLvl);
					oStorage.put("KPIRTO-yellow",  yellowLvl);
					this.byId("inputGreen").setValue(100);
					this.byId("inputYellow").setValue(80);
					this.byId("inputRed").setValue("< 80");
				break;
				case "3":
					oStorage.put("KPIRemains-green",  greenLvl);
					oStorage.put("KPIRemains-yellow",  yellowLvl);	
					this.byId("inputGreen").setValue(100);
					this.byId("inputYellow").setValue(80);
					this.byId("inputRed").setValue("< 80");
				break;
			}
		

		},
		onSaveChanges: function() {
			var oStorage=jQuery.sap.storage(jQuery.sap.storage.Type.local);

			//получение процента для зеленого и желтого цвета
			var greenLvl = this.byId("inputGreen").getValue();
			var yellowLvl = this.byId("inputYellow").getValue();
			//Ключ столбца из выпадающего списка
			var ComboBoxKey= this.getView().byId("ComboBox").mProperties.selectedKey;
			switch (ComboBoxKey) {
				case "1": 
					oStorage.put("KPIWrite-offs-green",  greenLvl);
					oStorage.put("KPIWrite-offs-yellow",  yellowLvl);
				break;
				case "2":
					oStorage.put("KPIRTO-green",  greenLvl);
					oStorage.put("KPIRTO-yellow",  yellowLvl);
				break;
				case "3":
					oStorage.put("KPIRemains-green",  greenLvl);
					oStorage.put("KPIRemains-yellow",  yellowLvl);
				break;
			}
		
		/*	var oEntry = {};
			var oModel = sap.ui.getCore().getModel("plants");
			var greenLvl = this.byId("inputGreen").getValue();
			var yellowLvl = this.byId("inputYellow").getValue();
			if (parseFloat(greenLvl) <= parseFloat(yellowLvl)) {
				MessageBox.alert("Значение для зеленого статуса должно быть больше значения для желтого!");
			} else {
				oModel.read("USERS?$filter=ID eq " + selectedUserId, null, [], true,
					function(oData, oResponse) {
						console.log(oData.results);
						oEntry = oData.results[0];
						oEntry.GREEN_LVL = greenLvl;
						oEntry.YELLOW_LVL = yellowLvl;
						oModel.update("/USERS(" + oEntry.ID + ")", oEntry, null, function() {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							MessageBox.show(
								"Настройки успешно изменены", {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Изменение настроек",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						}, function() {
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
			}*/
		},
		inputYellowLiveChange: function(oEvent) {
			var newValue = oEvent.getParameter("value");
			this.byId("inputRed").setValue("< " + newValue);
		}

	});

});
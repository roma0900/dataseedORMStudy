sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../services/DictionaryService"
], function(baseController, messageBox, utilities, history, filter, filterOperator, dictionaryService) {
	"use strict";
	
	return baseController.extend("com.sap.build.standard.scopeCopy.controller.TMaterialDictionatyPage", {
		onInit: function(){
			dictionaryService.getOTable(this.getView().byId("dictionaryDataTable"));
		},
	
		onAfterRendering: function(){
			jQuery.sap.delayedCall(100,null,function(){
				var oModel = sap.ui.getCore().getModel("plants");
				oModel.updateBindings(true);
			});
		},
		
		_onPageNavButtonPress: function(oEvent){
			var oBindingContext = oEvent.getSource().getBindingContext();
	
			return new Promise(function(fnResolve) {
	
				this.doNavigate("PlantsPage", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					messageBox.error(err.message);
				}
			});
		}		,
		_onDelete: function(oEvent){
			dictionaryService.deleteCurrentRow(this.getView().byId("dictionaryDataTable"));
		}
	});
	
});
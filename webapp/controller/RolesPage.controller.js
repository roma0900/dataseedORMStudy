sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/m/MessageBox"
], function(Controller, messageBox) {
	"use strict";

	return Controller.extend("com.sap.build.standard.scopeCopy.controller.RolesPage", {
		tableBindItems: function() {
			var table = [];
			var oResourseBundle = sap.ui.getCore().getModel("i18n").getResourceBundle();
			var admin = {
				ID: "1",
				Description: oResourseBundle.getText("Admin"),
				LevelName: "",
				AccessLevel: "",
				ParentNodeID: "0",
				__metadata: ""
			};
			var supervisor = {
				ID: "2",
				Description: oResourseBundle.getText("Supervisor"),
				LevelName: "",
				AccessLevel: "",
				ParentNodeID: "0",
				__metadata: ""
			};
			table.push(admin);
			table.push(supervisor);
			var data = {
				root: table
			};
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oTable = this.getView().byId("RolesDataTable").setModel(oJSModel1);
			oJSModel1.setData(data);
			oTable.setModel(oJSModel1);
			oTable.bindRows({
				path: '/root',
				parameters: {
					countMode: 'Inline',
					treeAnnotationProperties: {
						hierarchyNodeFor: 'ID',
						hierarchyParentNodeFor: 'ParentNodeID',
						hierarchyDrillStateFor: 'DrillState'
					}
				}
			});
		},
		onInit: function() {
			this.tableBindItems();
		}
	});
});
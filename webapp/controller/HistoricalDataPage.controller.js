sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/ui/model/json/JSONModel", "./utilities", "../services/DictionaryService",
	"../libs/XLSXlib"
], function(Controller, MessageBox, XLSXjs, utilities, dictionaryService) {
	"use strict";
	var selectedItem;
	var firstEnter=false;
	var isClear=true;
	var inputValue;
	var size=0;

	return Controller.extend("com.sap.build.standard.scopeCopy.controller.HistoricalDataPage", {
		onInit: function() {
			selectedItem = "HistData";
			console.log(selectedItem);
			this.DataCSV = {};
		},
		onSelectionChange: function(oEvent){
			
			console.log(this);
			var newSelectedItem = oEvent.getParameters().item.mProperties.key;
			if(newSelectedItem !== selectedItem){
				selectedItem = newSelectedItem;
			}
			if(selectedItem === "HistData") {
				this.getView().byId("histForm").setVisible(true);
				this.getView().byId("HistTable").setVisible(true);
			}
			if(selectedItem !== "HistData") {
				this.getView().byId("histForm").setVisible(false);
				this.getView().byId("HistTable").setVisible(false);
			}
		},
		onChangeFUP: function(e) {
			console.log(this);
			var input = "";
			switch (selectedItem) {
				case "HistData":
					input = "idfileUploader";
					break;
				default:
					input = "idfileUploader";
					break;
			}
			this.StartDialog = new sap.m.BusyDialog({
			title:'{i18n>UploadingHistData}',
			showCancelButton: true,
			endButton: new sap.m.Button({
					text: '{i18n>Close}',
					press: function () {
						var msg = new sap.m.Text({text: "{i18n>SuccessHistMsg}"});
						sap.m.MessageBox.show(msg, {
							actions: [sap.m.MessageBox.Action.OK],
							title: "{i18n>UploadingHistData}",
							duration: 3000, animationDuration: 2000
						});
						this.StartDialog.close();
					}.bind(this)
				})
			});
			inputValue = this.getView().byId(input).mProperties.value;
			if (inputValue === "") {
				var msg = new sap.m.Text({text: "{i18n>NoFileSelected}"});
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					msg,
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			} else if (inputValue.split(".")[1] !== "csv" && inputValue.split(".")[1] !== "xlsx") {
				var msg = new sap.m.Text({text: "{i18n>SuccessHistMsg}"});
				console.log("succ1");
				MessageBox.Icon.WARNING;
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.show(
					"Видимо, вы выбрали неподдерживаемый файл",
					sap.ui.commons.MessageBox.Icon.WARNING,
					"Уупс, что-то пошло не так", [sap.ui.commons.MessageBox.Action.OK],
					sap.ui.commons.MessageBox.Action.YES);
				return;
			}
			// this.file=e.getParameter("files");
			else if (inputValue.split(".")[1] === "csv") {
				this.StartDialog.open();
				size = e.getParameter("files")[0].size; //in bytes
				this._import(e.getParameter("files") && e.getParameter("files")[0]);
			}
			else if (inputValue.split(".")[1] === "xlsx") {
				this.StartDialog.open();
				this.StartDialog = new sap.m.BusyDialog({
				text:'Loading Data...'
			});
			this.StartDialog.open();
				size = e.getParameter("files")[0].size; //in bytes
				dictionaryService.Shopimport(e.getParameter("files") && e.getParameter("files")[0],this.getView().byId("HistTable"));
			}
			firstEnter=true;
		},
		_import: function(file) {
			var that = this;
			if (file && window.FileReader) {
				var reader = new FileReader();
				this.handleOnLoad = this.handleOnLoad.bind(this);
				reader.onload = this.handleOnLoad;
				reader.readAsText(file);
			}
		},
		handleOnLoad: function(e) {
			var strCSV = e.target.result; //string in CSV
			strCSV = strCSV.split('\n');
			for (var i in strCSV) {
				strCSV[i] = strCSV[i].split(';');
			}
			strCSV.splice(0, 1);
			strCSV.splice(strCSV.length - 1, 1);
			this.DataCSV = strCSV;
			this.onUpload();
		}, 
		onUpload: function(e) {
			if (firstEnter) {
				// this.onDialogPress();
				var oTable = this.getView().byId("HistTable");
				if (inputValue.split(".")[1] === "csv") {
					var data = this.DataCSV;
					var count = data.length;
					var tableRows = [];
					for (var i = 0; i < 20; i++) {
						var row = {
							IP_DATE: data[i][0],
							IP_DTYPE: data[i][1],
							STORE_ID: data[i][2],
							RTO_AMOUNT: data[i][3],
							STOCK_AMOUNT: data[i][4],
							MOVE_AMOUNT: data[i][5],
							KPI_TRAFFIC: data[i][6],
							KPI_PLAN_AVG: data[i][7],
							KPI_PLAN_COMPL: data[i][8]
						};
						tableRows.push(row);
					}
					var dataTable = {
						root: tableRows
					};
					var oJSModel1 = new sap.ui.model.json.JSONModel();
					sap.ui.getCore().setModel(oJSModel1, "HistDataModel");
					oTable.setModel(oJSModel1);
					oJSModel1.setData(dataTable);
					oTable.setModel(oJSModel1);
					oTable.bindRows({
						path: '/root'
					});
				}
				// for (i=1; i<=100; i++) {
				// 	this.progress.setPercentValue(i);
				// 	this.progress.setDisplayValue(i+"%");
				// }
				// this.progress.setPercentValue(100);
				// this.progress.setDisplayValue("100%");
				// this.beginBtn.setVisible(false);
				this.StartDialog.close();
				var msg = new sap.m.Text({text: "{i18n>SuccessHistMsg}"});
				sap.m.MessageBox.show(msg, {
					actions: [sap.m.MessageBox.Action.OK],
					title: "{i18n>UploadingHistData}",
					duration: 3000, animationDuration: 2000
				});
				oTable.setVisible(true);
				console.log("succ2");
				firstEnter=false;
	            isClear=false;
			}
			else if (isClear) {
				this.onChangeFUP(e);
			}
		},
		onClear: function() {
			var input = "";
			switch (selectedItem) {
				case "HistData":
					input = "idfileUploader";
					break;
				default:
					input = "idfileUploader";
					break;
			}
			this.getView().byId(input).setValue("");
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			var oTable = this.getView().byId("HistTable").setModel(oJSModel1);
			oTable.setVisible(false);
			isClear=true;
		},
		onDialogPress: function () {
			if (!this.pressDialog) {
				this.progress = new sap.m.ProgressIndicator("Indicator", {
					width: "100%",
					percentValue: 0,
					displayValue: "0%",
					state: "None"
				});
				var oGrid = new sap.ui.layout.Grid({
					defaultSpan: "XL12 L12 M12 S12"
				});
				oGrid.addContent(this.progress);
				this.pressDialog = new sap.m.Dialog({
					title: '{i18n>UploadingHistData}',
					content: oGrid, 
					endButton: new sap.m.Button({
						text: '{i18n>Close}',
						press: function () {
							var msg = new sap.m.Text({text: "{i18n>SuccessHistMsg}"});
							sap.m.MessageBox.show(msg, {
								actions: [sap.m.MessageBox.Action.OK],
								title: "{i18n>UploadingHistData}",
								duration: 3000, animationDuration: 2000
							});
							this.pressDialog.close();
							this.progress.setPercentValue(0);
							this.progress.setDisplayValue("0%");
						}.bind(this)
					}),
					beginButton: this.beginBtn = new sap.m.Button({
						text: '{i18n>CancelBtn}',
						visible: true,
						press: function () {
							this.pressDialog.close();
						}.bind(this)
					})
				});
				
				//to get access to the global model
				this.getView().addDependent(this.pressDialog);
			}
			this.pressDialog.open();
		}
	});
});
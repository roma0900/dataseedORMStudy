sap.ui.define(["../controller/utilities"], function(utilites) {
	"use strict";
	//todo: вывести в глобальные константы.
	// тип справочника : магазины.
	var typePlant = "shopDictionary";
	// тип справочника : товары.
	var typeMaterial = "productDicrionary";
	// тип справочника : группа иерархий 1.
	var typeGroup1 = "group1";
	// тип справочника : группа иерархий 2.
	var typeGroup2 = "group2";
	// тип справочника : группа иерархий 3.
	var typeGroup3 = "group3";
	// тип справочника : группа иерархий 4.
	var typeGroup4 = "group4";
	// тип справочника : иерархия магазинов.
	var typeShopHier = "shopHierarchy";
	// Удаление строк
	var deleteRowText = "Удаление строк справочника";

//todo: сделать модель , возвращающую колонки (https://stackoverflow.com/questions/21731176/dynamic-binding-of-table-column-and-rows)
	// Объект названий колонок для справочника магазинов.
	var plantColumnNames = {
		"PLANT": "{i18n>PLANT}",
		"ADDRESS": "{i18n>ADDRESS}",
		"BIC_ZFIO_EMP": "{i18n>BIC_ZFIO_EMP}"
	};
	// Объект названий колонок для справочника товаров.
	var productColumnNames = {
		"OBJ_KEY": "{i18n>ID}",
		"OBJ_TXT": "{i18n>OBJ_TXT_PRODUCT}"
	};
	// Объект названий колонок для справочника товаров.
	var groupColumnNames = {
		"OBJ_KEY": "{i18n>ID}",
		"OBJ_TXT": "{i18n>OBJ_TXT_GROUP}"
	};

	// id диалогового окна добавления магазина.
	var plantAddDialog = "plantAddDialog";
	// id диалогового окна добавления товара.
	var productAddDialog = "productAddDialog";
	// id диалогового окна добавления группы.
	var groupAddDialog = "groupAddDialog";

	// id диалогового окна изменения магазина.
	var plantEditDialog = "plantEditDialog";
	// id диалогового окна изменения товара.
	var productEditDialog = "productEditDialog";
	// id диалогового окна изменения группы.
	var groupEditDialog = "groupEditDialog";

	// Заголовки спарвочников.
	// Заголовок справочника магазинов.
	var titlePlantDictionary = "{i18n>PlantList}";
	// Заголовок справочника товаров.
	var titleProductDictionary = "{i18n>Products}";
	// Заголовок справочника группы иерархий 1.
	var titleGroup1Dictionary = "{i18n>V_PGROUP1}";
	// Заголовок справочника группы иерархий 2.
	var titleGroup2Dictionary = "{i18n>V_PGROUP2}";
	// Заголовок справочника группы иерархий 3.
	var titleGroup3Dictionary = "{i18n>V_PGROUP3}";
	// Заголовок справочника группы иерархий 4.
	var titleGroup4Dictionary = "{i18n>V_PGROUP4}";

	// Путь для таблицы магазинов. 
	var pathStore = "/V_STORE";
	// Путь для таблицы магазинов. 
	var pathProduct = "/V_PRODUCT";
	// Путь для таблицы магазинов. 
	var pathGroupOne = "/V_PGROUP1";
	// Путь для таблицы магазинов. 
	var pathGroupTwo = "/V_PGROUP2";
	// Путь для таблицы магазинов. 
	var pathGroupThree = "/V_PGROUP3";
	// Путь для таблицы магазинов. 
	var pathGroupFour = "/V_PGROUP4";
	// Название используемой модели.
	var modelName = "";
	
	
	// Колонка, по которой проходит фильтрация
	var filtredColumnName;
	return {
		/**
		 * Возвращает oTable.
		 * @param typeDictionary	тип справочника.
		 * @param table				вьюха.
		 * @param pressHandler		функция смены таблички.
		 * @param checkAdmin		есть ли роль админа у пользователя.
		 * @param model 			модель , по которой ведется поиск.
		 * @param filterValue		значение для фильтра.
		 */
		getOTable: function(table, typeDictionary, pressHandler, checkAdmin, model, filterValue) {
			this.pressHandler = pressHandler;
			// Получаем oModel и oTable в зависимости от типа таблица.
			/*var oJSModel1 = new sap.ui.model.json.JSONModel();*/
			var oTable = table.setModel(model);
			var filterArray = null;
			if (filtredColumnName && filterValue) {
				filterArray = utilites.getFiltres(filterValue, [filtredColumnName]);
			} else if (filterValue) {
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.m.MessageBox.error(
					new sap.m.Text({
						text: "{i18n>DONT_SELECT_COLUMN_FOR_SEARCH}"
					}), {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Что-то пошло не так",
						actions: sap.m.MessageBox.Action.OK
					}
				);
			}
			var checkFilterValue = filterValue === undefined;
			var rows = oTable.mBindingInfos.rows;
			var isNewPath = true;
			if(rows){
				isNewPath = rows.path !== pathStore;
			}
			switch (typeDictionary) {
				case typePlant:
					if (checkFilterValue && isNewPath) {
						oTable.setTitle(titlePlantDictionary);
						oTable.removeAllColumns();
						this.addColumns(plantColumnNames, oTable, checkAdmin);
					}
					oTable.bindRows({
						path: pathStore,
						filters: filterArray
					});
					return oTable;
				case typeMaterial:
					if (checkFilterValue && oTable.mBindingInfos.rows.path !== pathProduct) {
						oTable.setTitle(titleProductDictionary);
						oTable.removeAllColumns();
						this.addColumns(productColumnNames, oTable, checkAdmin);
					}
					oTable.bindRows({
						path: pathProduct,
						filters: filterArray
					});
					return oTable;
				case typeGroup1:
					if (checkFilterValue && oTable.mBindingInfos.rows.path !== pathGroupOne) {
						oTable.setTitle(titleGroup1Dictionary);
						oTable.removeAllColumns();
						this.addColumns(groupColumnNames, oTable, checkAdmin);
					}
					oTable.bindRows({
						path: pathGroupOne,
						filters: filterArray
					});
					return oTable;
				case typeGroup2:
					if (checkFilterValue && oTable.mBindingInfos.rows.path !== pathGroupTwo) {
						oTable.setTitle(titleGroup2Dictionary);
						oTable.removeAllColumns();
						this.addColumns(groupColumnNames, oTable, checkAdmin);
					}
					oTable.bindRows({
						path: pathGroupTwo,
						filters: filterArray
					});
					return oTable;
				case typeGroup3:
					if (checkFilterValue && oTable.mBindingInfos.rows.path !== pathGroupThree) {
						oTable.setTitle(titleGroup3Dictionary);
						oTable.removeAllColumns();
						this.addColumns(groupColumnNames, oTable, checkAdmin);
					}
					oTable.bindRows({
						path: pathGroupThree,
						filters: filterArray
					});
					return oTable;
				case typeGroup4:
					if (checkFilterValue && oTable.mBindingInfos.rows.path !== pathGroupFour) {
						oTable.setTitle(titleGroup4Dictionary);
						oTable.removeAllColumns();
						this.addColumns(groupColumnNames, oTable, checkAdmin);
					}
					oTable.bindRows({
						path: pathGroupFour,
						filters: filterArray
					});
					return oTable;
				case typeShopHier:
					
					return oTable;
				
				
				default:
					oTable = null;
					console.error("Неизвестный тип справочника");
					break;
			}
		},
		// добавляет в dictionaryTableData строки догруженные из файла, при этом удаляются предыдущие значения из таблицы
		// необходима библиотека XLSX
		/**
		 * Отобпражение данных из загруженного файла.
		 * 
		 * @param file	файл
		 * @param table таблица
		 */
		Shopimport: function(file, table) {
			var oJSModel1 = new sap.ui.model.json.JSONModel();
			table.setModel(oJSModel1);
			if (file && window.FileReader) {
				table.destroyColumns();
				var reader = new FileReader();
				var result = {},
					data;
				reader.onload = function(e) {
					data = e.target.result;
					var wb = XLSX.read(data, {
						type: 'binary'
					});
					wb.SheetNames.forEach(function(sheetName) {
						var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
						if (roa.length > 0) {
							result[sheetName] = roa;
						}
					});
					var resColumns = result.Sheet1[0];
					Object.keys(resColumns).forEach(function(key) {
						var oColumn = new sap.ui.table.Column({
							label: new sap.ui.commons.Label({
								text: key
							}),
							template: new sap.ui.commons.TextField().bindProperty("value", key)
						});
						table.addColumn(oColumn);
					});
					oJSModel1.setData(result);
					table.setModel(oJSModel1);
					table.bindRows({
						path: '/Sheet1'
					});
				};
				reader.readAsBinaryString(file);
			}
		},
		/**
		 * Удаляет выбранную строку.
		 * @param table				таблица справочника.
		 * @param typeDictionary	тип справочника.
		 * @param pressHandler		функция редактирования.
		 * @param model				модель oData.
		 */
		deleteCurrentRow: function(table, typeDictionary, pressHandler, model) {
			this.pressHandler = pressHandler;
			var idArray = table.getSelectedIndices();
			if (idArray.length === 0 || idArray.length < 0) {
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.m.MessageBox.show(
					"Не выбрана ни одна строка	", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: deleteRowText,
						actions: sap.m.MessageBox.Action.OK
					}
				);
				return;
			}
			var me = this;
			var dialogDeleteRow = new sap.m.Dialog({
				title: "Удаление",
				type: "Message",
				content: [
					new sap.m.Label({
						text: "Вы действительно хотите удалить запись?"
					})
				],
				beginButton: new sap.m.Button({
					text: "Удалить",
					press: function() {
						var isError = false;
						var textSucces;
						var textError;
						if (idArray.length > 1) {
							textSucces = "{i18n>SUCCES_DELETE_ROWS}";
							textError = "{i18n>SUCCES_DELETE_ROWS}";
						} else {
							textSucces = "{i18n>SUCCES_DELETE_ROW}";
							textError = "{i18n>ERROR_DELETE_ROW}";
						}
						idArray.forEach(function(element) {
							var pathDelete;
							var rowForDelete = table.getContextByIndex(element).getObject();
							switch (typeDictionary) {
								case typePlant:
									pathDelete = pathStore+"(PLANT='" + rowForDelete.PLANT + "')";
									break;
								case typeMaterial:
									pathDelete = pathProduct+"(OBJ_KEY='" + rowForDelete.OBJ_KEY + "')";
									break;
								case typeGroup1:
									pathDelete = pathGroupOne+"(OBJ_KEY='" + rowForDelete.OBJ_KEY + "')";
									break;
								case typeGroup2:
									pathDelete = pathGroupTwo+"(OBJ_KEY='" + rowForDelete.OBJ_KEY + "')";
									break;
								case typeGroup3:
									pathDelete = pathGroupThree+"(OBJ_KEY='" + rowForDelete.OBJ_KEY + "')";
									break;
								case typeGroup4:
									pathDelete = pathGroupFour+"(OBJ_KEY='" + rowForDelete.OBJ_KEY + "')";
									break;
								default:
									pathDelete = null;
									console.error("Неизвестный тип справочника");
									break;
							}
							model.remove(pathDelete, null, function() {

							}, function() {
								isError = true;
							});
						});
						if (isError) {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.error(
								new sap.m.Text({
									text: textError
								}), {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Что-то пошло не так",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						} else {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.success(
								new sap.m.Text({
									text: textSucces
								}), {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Удаление строк",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						}
						dialogDeleteRow.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Закрыть",
					press: function() {
						dialogDeleteRow.close();
					}
				}),
				afterClose: function() {
					dialogDeleteRow.destroy();
					me.getOTable(table, typeDictionary, me.pressHandler);
				}
			});
			dialogDeleteRow.open();
		},

		/**
		 * Добавление колонок в таблицу из словаря.
		 * 
		 * @param columnNames	мапа колонок
		 * @param oTable 		таблица
		 * @param checkAdmin	есть ли роль админа
		 */
					
		addColumns: function(columnNames, oTable, checkAdmin) {
			for (var key in columnNames) {
				var value = columnNames[key];
				var oColumn = new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: value
					}),
					template: new sap.m.ObjectIdentifier({
						text: "{" +key + "}"
					}),
					sortProperty: key,
					filterProperty: key
				});
				this.addMenuColumn(oColumn, this.compareIntegers, oTable);
				oTable.addColumn(oColumn);
			}
			// добавляем колонку редактирования.
			if(checkAdmin){
				var me = this;
				var icon = new sap.ui.core.Icon({
					src: "sap-icon://edit",
					press: me.pressHandler
				});
				var editColumn = new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: "{i18n>Editing}"
					}),
					template: icon,
					width: "15%"
				});
				oTable.addColumn(editColumn);
			}
		},

		/**
		 * Компаратор. 
		 *  
		 * @param value1 значение для сравнения 1
		 * @param value2 значение для сравнения 2
		 */
		compareIntegers: function(value1, value2) {
			if ((value1 == null || value1 === undefined || value1 === "") && (value2 == null || value2 === undefined || value2 === "")) {
				return 0;
			}
			if ((value1 == null || value1 === undefined || value1 === "")) {
				return -1;
			}
			if ((value2 == null || value2 === undefined || value2 === "")) {
				return 1;
			}
			if (value1 < value2) {
				return -1;
			}
			if (value1 === value2) {
				return 0;
			}
			if (value1 > value2) {
				return 1;
			}
		},

		/**
		 * Добавляет меню к колонке.
		 * 
		 * @param oColumn		колонка
		 * @param comparator	компаратор
		 * @param oTable		таблица 
		 */
		addMenuColumn: function(oColumn, comparator, oTable) {
			var oCustomMenu = new sap.ui.commons.Menu();

			oCustomMenu.addItem(new sap.ui.commons.MenuItem({
				text: "Сортировка по восходящей",
				icon: "sap-icon://sort-ascending",
				select: function() {
					var oSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), false);
					oSorter.fnCompare = comparator;
					oTable.getBinding("rows").sort(oSorter);

					for (var i = 0; i < oTable.getColumns().length; i++) {
						oTable.getColumns()[i].setSorted(false);
					}
					oColumn.setSorted(true);
					oColumn.setSortOrder(sap.ui.table.SortOrder.Ascending);
				}
			}));
			oCustomMenu.addItem(new sap.ui.commons.MenuItem({
				text: "Сортировка по нисходящей",
				icon: "sap-icon://sort-descending",
				select: function(oControlEvent) {
					var oSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), true);
					oSorter.fnCompare = comparator;
					oTable.getBinding("rows").sort(oSorter);

					for (var i = 0; i < oTable.getColumns().length; i++) {
						oTable.getColumns()[i].setSorted(false);
					}

					oColumn.setSorted(true);
					oColumn.setSortOrder(sap.ui.table.SortOrder.Descending);
				}
			}));
			oCustomMenu.addItem(new sap.ui.commons.MenuItem({
				text: "Выбрать колонку для поиска строки",
				icon: "sap-icon://search",
				select: function(oControlEvent) {
					for (var i = 0; i < oTable.getColumns().length; i++) {
						oTable.getColumns()[i].setFiltered(false);
					}
					oColumn.setFiltered(true);
					filtredColumnName = oColumn.mProperties.sortProperty;
				}
			}));
			filtredColumnName = undefined;
			oColumn.setMenu(oCustomMenu);
			return oColumn;
		},

		/**
		 * Добавление строки.
		 *
		 * @param typeDictionary	тип справочника.
		 * @param table 			таблица.
		 * @param pressHandler		функция клика.
		 * @param model				модель oData.
		 */
		addRow: function(table, typeDictionary, pressHandler, model) {
			var contextMapName;
			var pathAdd;
			var dialogAddRow;
			switch (typeDictionary) {
				case typePlant:
					pathAdd = pathStore;
					contextMapName = plantColumnNames;
					dialogAddRow = sap.ui.getCore().byId(plantAddDialog);
					if (!dialogAddRow) {
						dialogAddRow = this.createDialogAdd(table, plantAddDialog, typeDictionary, contextMapName, pathAdd, pressHandler, model);
					} else {
						this.addOrGetContextToDialog(dialogAddRow, contextMapName);
					}
					break;
				case typeMaterial:
					pathAdd = pathProduct;
					contextMapName = productColumnNames;
					dialogAddRow = sap.ui.getCore().byId(productAddDialog);
					if (!dialogAddRow) {
						dialogAddRow = this.createDialogAdd(table, productAddDialog, typeDictionary, contextMapName, pathAdd, pressHandler, model);
					} else {
						this.addOrGetContextToDialog(dialogAddRow, contextMapName);
					}
					break;
				case typeGroup1:
				case typeGroup2:
				case typeGroup3:
				case typeGroup4:
					switch (typeDictionary) {
						case typeGroup1:
							pathAdd = pathGroupOne;
							break;
						case typeGroup2:
							pathAdd = pathGroupTwo;
							break;
						case typeGroup3:
							pathAdd = pathGroupThree;
							break;
						case typeGroup4:
							pathAdd = pathGroupFour;
							break;
						default:
							break;
					}
					contextMapName = productColumnNames;
					dialogAddRow = sap.ui.getCore().byId(groupAddDialog);
					if (!dialogAddRow) {
						dialogAddRow = this.createDialogAdd(table, groupAddDialog, typeDictionary, contextMapName, pathAdd, pressHandler, model);
					} else {
						this.addOrGetContextToDialog(dialogAddRow, contextMapName);
					}
					break;
				default:
					break;
			}
		},

		/**
		 * Создание диалогового окна.
		 *
		 * @param table				таблица.
		 * @param idDialog			id диалога.
		 * @param typeDictionary	тип справочника.
		 * @param contextMapName	мапа названий полей.
		 * @param pathAdd			путь до вьюхи, в которую добавляется строка.
		 * @param pressHandler		функция клика.
		 * @param model				oData модель.
		 */
		createDialogAdd: function(table, idDialog, typeDictionary, contextMapName, pathAdd, pressHandler, model) {
			var me = this;
			var dialogAddRow = new sap.m.Dialog(idDialog, {
				title: "Добавление записи",
				type: "Message",
				beginButton: new sap.m.Button({
					text: "Добавить",
					press: function() {
						var oEntry;
						switch (typeDictionary) {
							case typePlant:
								oEntry = me.getContextValue(plantColumnNames);
								break;
							case typeMaterial:
								oEntry = me.getContextValue(productColumnNames);
								break;
							case typeGroup1:
							case typeGroup2:
							case typeGroup3:
							case typeGroup4:
								oEntry = me.getContextValue(groupColumnNames);
								break;
							default:
								break;
						}
						model.create(pathAdd, oEntry, null, function() {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.show(
								"Строка успешно добавлена", {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Добавление строки",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						}, function() {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.show(
								"Ошибка при добавлении строки", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Что-то пошло не так",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						});
						model.submitChanges();
						dialogAddRow.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Закрыть",
					press: function() {
						dialogAddRow.close();
					}
				}),
				afterClose: function() {
					dialogAddRow.destroyContent();
					dialogAddRow.destroy();
					me.getOTable(table, typeDictionary, me.pressHandler);
				}
			});
			this.addOrGetContextToDialog(dialogAddRow, contextMapName);
			return dialogAddRow;
		},

		/*
		 * Добавление полей в окно диалога.
		 *
		 * @param dialogAddRow   диалог
		 * @param contextMapName мапа полей добавляемой строки.
		 */
		addOrGetContextToDialog: function(dialogAddRow, contextMapName) {
			var simpleForm = new sap.ui.layout.VerticalLayout();
			for (var key in contextMapName) {
				var textFieldContext = sap.ui.getCore().byId(key);
				var context;
				if (!textFieldContext) {
					context = new sap.m.Toolbar({
						content: [new sap.m.Label({
							text: contextMapName[key],
							width: "50%"
						}), new sap.m.TextArea(key, {
							rows: 1,
							width: "100%"
						})]
					});
				} else {
					context = new sap.m.Toolbar({
						content: [new sap.m.Label({
							text: contextMapName[key],
							width: "50%"
						}), textFieldContext]
					});
				}
				simpleForm.addContent(context);
			}
			dialogAddRow.addContent(simpleForm);
			dialogAddRow.open();
		},

		/*
		 * Получение значений полей диалогового поля.
		 *
		 * @param fieldNamesMap мапа полей таблицы.
		 */
		getContextValue: function(fieldNamesMap) {
			var oEntry = {};
			for (var key in fieldNamesMap) {
				oEntry[key] = sap.ui.getCore().byId(key).getValue();
			}
			return oEntry;
		},

		/**
		 * Изменение строки.
		 *
		 * @param table				таблица
		 * @param typeDictionary	тип справочника
		 * @param rowObject			объект строки для изменения
		 * @param model				oData модель.
		 */
		editRow: function(table, typeDictionary, rowObject, model) {
			var contextMapName;
			var pathEdit;
			var dialogEditRow;
			var ID;
			switch (typeDictionary) {
				case typePlant:
					contextMapName = plantColumnNames;
					dialogEditRow = sap.ui.getCore().byId(plantEditDialog);
					ID = rowObject.PLANT;
					pathEdit = pathStore+"('" + ID + "')";
					if (!dialogEditRow) {
						dialogEditRow = this.createDialogEdit(table, plantEditDialog, typeDictionary, contextMapName, pathEdit, rowObject, model);
					} else {
						this.addOrGetContextToDialog(dialogEditRow, contextMapName);
					}
					break;
				case typeMaterial:
					contextMapName = productColumnNames;
					ID = rowObject.OBJ_KEY;
					dialogEditRow = sap.ui.getCore().byId(productEditDialog);
					pathEdit = pathProduct+"('" + ID + "')";
					if (!dialogEditRow) {
						dialogEditRow = this.createDialogEdit(table, productEditDialog, typeDictionary, contextMapName, pathEdit, rowObject, model);
					} else {
						this.addOrGetContextToDialog(dialogEditRow, contextMapName);
					}
					break;
				case typeGroup1:
				case typeGroup2:
				case typeGroup3:
				case typeGroup4:
					contextMapName = productColumnNames;
					dialogEditRow = sap.ui.getCore().byId(groupEditDialog);
					ID = rowObject.OBJ_KEY;
					switch (typeDictionary) {
						case typeGroup1:
							pathEdit = pathGroupOne+"('" + ID + "')";
							break;
						case typeGroup2:
							pathEdit = pathGroupTwo+"('" + ID + "')";
							break;
						case typeGroup3:
							pathEdit = pathGroupThree+"('" + ID + "')";
							break;
						case typeGroup4:
							pathEdit = pathGroupFour+"('" + ID + "')";
							break;
						default:
							break;
					}
					if (!dialogEditRow) {
						dialogEditRow = this.createDialogEdit(table, groupEditDialog, typeDictionary, contextMapName, pathEdit, rowObject, model);
					} else {
						this.addOrGetContextToDialog(dialogEditRow, contextMapName);
					}
					break;
				default:
					break;
			}
		},
		/**
		 * Создание диалогового окна для редактирования строки.
		 * @param table 			таблица
		 * @param idDialog			id диалогового окна изменения строки.
		 * @param typeDictionary	тип справочника.
		 * @param contextMapName	мапа полей строки.
		 * @param pathEdit			путь изменения строки( таблицца).
		 * @param rowObject			объект строки.
		 * @param model				модель oData.
		 */
		createDialogEdit: function(table, idDialog, typeDictionary, contextMapName, pathEdit, rowObject, model) {
			var me = this;
			var dialogEditRow = new sap.m.Dialog(idDialog, {
				title: "Редактирование записи",
				type: "Message",
				beginButton: new sap.m.Button({
					text: "Сохранить",
					press: function() {
						var oEntry;
						switch (typeDictionary) {
							case typePlant:
								oEntry = me.getContextValue(plantColumnNames);
								break;
							case typeMaterial:
								oEntry = me.getContextValue(productColumnNames);
								break;
							case typeGroup1:
							case typeGroup2:
							case typeGroup3:
							case typeGroup4:
								oEntry = me.getContextValue(groupColumnNames);
								break;
							default:
								break;
						}
						//todo: Добавить функции обработки успеха / провала обнавления
						model.update(pathEdit, oEntry, null, function() {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.show(
								"Строка успешно изменена", {
									icon: sap.m.MessageBox.Icon.SUCCESS,
									title: "Изменение строки",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						}, function() {
							jQuery.sap.require("sap.ui.commons.MessageBox");
							sap.m.MessageBox.show(
								"Ошибка при изменении строки", {
									icon: sap.m.MessageBox.Icon.WARNING,
									title: "Что-то пошло не так",
									actions: sap.m.MessageBox.Action.OK
								}
							);
						});
						model.submitChanges();
						dialogEditRow.close();
					}
				}),
				endButton: new sap.m.Button({
					text: "Закрыть",
					press: function() {
						dialogEditRow.close();
					}
				}),
				afterClose: function() {
					dialogEditRow.destroyContent();
					dialogEditRow.destroy();
					me.getOTable(table, typeDictionary, me.pressHandler);
				}
			});
			this.addOrGetContextToDialogEdit(dialogEditRow, contextMapName, rowObject);
			return dialogEditRow;
		},

		/*
		 * Добавление полей в диалоговое окно изменения строк.
		 *
		 * @param dialogEditRow окно изменения строки.
		 * @param contextMapName мапа полей. .
		 * @param rowObject объект строки.
		 */
		addOrGetContextToDialogEdit: function(dialogEditRow, contextMapName, rowObject) {
			var simpleForm = new sap.ui.layout.VerticalLayout();
			for (var key in contextMapName) {

				var textFieldContext = sap.ui.getCore().byId(key);
				var context;
				if (!textFieldContext) {
					context = new sap.m.Toolbar({
						content: [new sap.m.Label({
								text: contextMapName[key],
								width: "50%"
							}),
							new sap.m.TextArea(key, {
								rows: 1,
								width: "100%",
								liveChange: function(chEvent) {
									rowObject[key] = chEvent.getParameter(key);
								}
							}).setValue(rowObject[key])
						]
					});
				} else {
					context = new sap.m.Toolbar({
						content: [new sap.m.Label({
							text: contextMapName[key],
							width: "50%"
						}), textFieldContext.setValue(rowObject[key])]
					});
				}
				simpleForm.addContent(context);
			}
			dialogEditRow.addContent(simpleForm);
			dialogEditRow.open();
		},
		
		/**
		 * Добавляет кнопки удаления, добавления , редактирования записей таблицы.
		 * 
		 * @param dictionaryController	контроллер справочников.
		 * @param buttonToolbar 		тулбар кнопок таблицы.
		 */
		 addAdminButtons: function(dictionaryController,buttonToolbar){
		 	buttonToolbar.addContent(new sap.m.OverflowToolbarButton({
		 		icon:"sap-icon://positive",
		 		text:"{i18n>Add}",
		 		type:"Transparent",
		 		press: dictionaryController.onAdd
		 	}));
		 	buttonToolbar.addContent(new sap.m.OverflowToolbarButton({
		 		icon:"sap-icon://decline",
		 		text:"{i18n>Delete}",
		 		type:"Transparent",
		 		press:dictionaryController.onDelete
		 	}));
		 }
	};
});
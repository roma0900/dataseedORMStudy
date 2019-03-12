sap.ui.define([
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function(Filter, FilterOperator) {
	"use strict";

	// class providing static utility methods to retrieve entity default values.

	return {
		/**
		 * Возвращает фильтр поиска для колонок.
		 * 
		 * @param filterValue	значение, по которому происходит фильтрация.
		 * @param columnFilters колонки, по которым происходит фильтрация.
		 */
		getFiltres: function(filterValue, columnFilters) {
			// Если нет значения фильтрации , то возвращаем null
			if (filterValue === undefined) {
				return null;
			} else {
				var filterArray = [];
				columnFilters.forEach(function(columnName) {
					// Для локальных тестов без кавычек '' не работает=/
					filterArray.push(new Filter(columnName, FilterOperator.Contains,  filterValue));
				});
				return filterArray;
			}
		},
		/**
		 * Выводит сообщение, о том , что ни одна колонка не выбрана.
		 */
		sendMessageNoSelectColumn: function() {
			jQuery.sap.require("sap.ui.commons.MessageBox");
			sap.m.MessageBox.show(
				"Для поиска строки выберите хотя бы одну колонку", {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: "Поиск строки",
					actions: sap.m.MessageBox.Action.OK
				}
			);
		},
		/**
		 * Проверяет имеет ли пользователь роль администратора.
		 */
		 checkAdminUserRole:function(controller){
		 	return controller.getOwnerComponent("userData").oModels.userRole.oData.admin;
		 }
	};
});
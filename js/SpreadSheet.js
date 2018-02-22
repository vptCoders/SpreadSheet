"use strict";

function SpreadSheet(parentElement, options) {
	let _containerEl = null;
	let _dataArray = [];
	let _stageContainer = DOMManager.createDiv();
	_stageContainer.classList.add("SpreadSheet--stage_container");

	let _dataContainer = DOMManager.createDiv();
	_dataContainer.classList.add("SpreadSheet--data_container");
	_stageContainer.appendChild(_dataContainer);

	let _selectionManager = null;
	let _dataTables = [];
	let _dataTablesChangedEvent = null;
	let _parentElementChangedEvent = null;
	let _data = null;

	let _horizontalHeadingTables = [];
	let _verticalHeadingTables = [];

	let _defaultOptions = {
		modules: {
			cursor: true,
			resize: true,
			ribbon: true,
			selection: true,
			virtualization: true,
		},

		showHeadings: true,
		numberOfColumns: 80,
		numberOfRows: 100,
	};

	let _userOptions = null;



	// 	Private methods:
	function parseContainer(containerEl) {
		if(containerEl) {		
			if(containerEl.tagName && containerEl.tagName.toLowerCase() === "div") {
				_containerEl = containerEl;
				_parentElementChangedEvent = new CustomEvent("SpreadSheetParentElementChanged", {
					detail: this, 
				});
				document.dispatchEvent(_parentElementChangedEvent);
				_containerEl.appendChild(_stageContainer);
			} else {
				throw new Error("SpreadSheet objects shall be contained in DIV elements.");
			}
		}
	}
	
	function getHorizontalHeadingTable(columnIndex) {
		// if frozen columns, different...
		return _horizontalHeadingTables[0];
	}







	// 	Constructor code:
	function SpreadSheet(parentElement, options) {
		parseContainer.call(this, parentElement);
		_userOptions = options;
		
		// this.setSelectionModule();
	}
	SpreadSheet.prototype = Object.create(this.constructor.prototype);
	SpreadSheet.prototype.constructor = SpreadSheet;

	// 	Properties setters/getters:
	Object.defineProperty(SpreadSheet.prototype, 'parentElement', {
		get: function() { 
			return _containerEl;
		},
		set: function(newContainerEl) {
			parseContainer.call(this, newContainerEl);
		}
	});
	Object.defineProperty(SpreadSheet.prototype, 'dataContainer', {
		get: function() { 
			return _dataContainer;
		}
	});
	Object.defineProperty(SpreadSheet.prototype, 'dataTables', {
		get: function() { 
			return _dataTables;
		}
	});
	Object.defineProperty(SpreadSheet.prototype, 'stage', {
		get: function() { 
			return _stageContainer;
		}
	});
	Object.defineProperty(SpreadSheet.prototype, 'columns', {
		get: function() { 
			return _defaultOptions.numberOfColumns;
		}
	});
	Object.defineProperty(SpreadSheet.prototype, 'rows', {
		get: function() { 
			return _defaultOptions.numberOfRows;
		}
	});


	SpreadSheet.prototype.createEmptySheet = function() {
		let _numberOfColumns = _defaultOptions.numberOfColumns;
		let _numberOfRows = _defaultOptions.numberOfRows;
		let _rows = {
			header: 1,
			body: _numberOfRows - 1,
		};

		_data = [];
		for(let i = 0; i < _numberOfRows; i++) {
			let newRowData = {
				rowData: [],
			};
			for(let j = 0; j < _numberOfColumns; j++) {
				let newCellData = {};
				newRowData.rowData.push(newCellData);
			}
			_data.push(newRowData);
		}

		let _wrapper = DOMManager.createDiv();
		_wrapper.classList.add("SpreadSheet--left_data_table_wrapper");
		let _cornerHeading = _stageContainer.querySelector(".SpreadSheet--corner_heading_wrapper");
		if(_cornerHeading) {
			let _cornerHeadingBCR = _cornerHeading.getBoundingClientRect();
			_wrapper.style.cssText = "left: " + _cornerHeadingBCR.width + "px; top: " + _cornerHeadingBCR.height + "px";
		}

		let _table = DOMManager.createEmptyTable(_rows, _numberOfColumns);
		_table.classList.add("SpreadSheet--table");
		_table.classList.add("SpreadSheet--data_table");
		_dataTables.push(_table);

		_dataTablesChangedEvent = new CustomEvent("createDataTable", {
			detail: {
				spreadsheet: this,
				table: _table,
			} 
		});

		document.dispatchEvent(_dataTablesChangedEvent);

		_wrapper.appendChild(_table);
		_dataContainer.appendChild(_wrapper);
	}


	SpreadSheet.prototype.createSheetFromData = function(data) {
		_data = data;
		let _table = DOMManager.createTableFromData(_data);
		_table.classList.add("SpreadSheet--table");
		_table.classList.add("SpreadSheet--data_table");

		let _container = DOMManager.createDiv();
		_container.style.cssText = "width: 3650px; height: 1030px; position: relative; left: 23px; top: 21px; overflow: hidden";

		_dataTables.push(_table);

		_dataTablesChangedEvent = new CustomEvent('dataTablesChanged', {
			detail: this,
		});
		document.dispatchEvent(_dataTablesChangedEvent);

		_container.appendChild(_table);
		_dataContainer.insertBefore(_container, _dataContainer.children[0]);

		// _dataContainer.appendChild(_container);
	}







	SpreadSheet.prototype.selectColumns = function(columnsIndexes) {
		let _selectedColumnSyle = "SpreadSheet--horizontal_heading_column_selected";
		let _selectedColumns = _stageContainer.querySelectorAll("." + _selectedColumnSyle);
		if(_selectedColumns && _selectedColumns.length) {
			let _numberOfSelectedColumns = _selectedColumns.length;
			for(let _curCol = 0; _curCol < _numberOfSelectedColumns; _curCol++) {
				_selectedColumns[_curCol].classList.remove(_selectedColumnSyle);
			}
		}

		if(columnsIndexes.constructor === Array) {
			let _numberOfColumns = columnsIndexes.length;
			for(let _curCol = 0; _curCol < _numberOfColumns; _curCol++) {
				let _horzHeadingTable = getHorizontalHeadingTable(columnsIndexes[_curCol]);
				_selectionManager.selectColumn(columnsIndexes[_curCol], _horzHeadingTable, _selectedColumnSyle);
			}
		} else if(Number.isInteger(columnsIndexes)) {
			let _horzHeadingTable = getHorizontalHeadingTable(columnsIndexes);
			_selectionManager.selectColumn(columnsIndexes, _horzHeadingTable, _selectedColumnSyle);
		} else {
			throw new Error("Cannot select the specified columns.");
		}
	}

	SpreadSheet.prototype.selectCell = function(cellIndexes) {
		let _selectedCellHorizontalHeadingSyle = "SpreadSheet--horizontal_heading_cell_selected";
		let _horzHeadingTable = _stageContainer.querySelector(".SpreadSheet--horizontal_heading_table");
		if(_horzHeadingTable) {
			_horzHeadingTable.children[0].children[cellIndexes.column].classList.add(_selectedCellHorizontalHeadingSyle);
		}

		let _selectedCellVerticalHeadingSyle = "SpreadSheet--vertical_heading_cell_selected";
		let _vertHeadingTable = _stageContainer.querySelector(".SpreadSheet--vertical_heading_table");
		if(_vertHeadingTable) {
			_vertHeadingTable.children[cellIndexes.row].children[0].classList.add(_selectedCellVerticalHeadingSyle);
		}

		// _selectionManager.selectCell(cellIndexes.row, cellIndexes.column, _dataTables[0], "thead");
	}


	SpreadSheet.prototype.clearSelection = function() {
		/*	Clear selected cells styling*/
		let _selectedColumnSyle = "SpreadSheet--horizontal_heading_column_selected";
		let _selectedColumns = _stageContainer.querySelectorAll("." + _selectedColumnSyle);
		if(_selectedColumns && _selectedColumns.length) {
			let _numberOfSelectedColumns = _selectedColumns.length;
			for(let _curCol = 0; _curCol < _numberOfSelectedColumns; _curCol++) {
				_selectedColumns[_curCol].classList.remove(_selectedColumnSyle);
			}
		}

		let _selectedCellHorizontalHeadingSyle = "SpreadSheet--horizontal_heading_cell_selected";
		let _selectedCellsHorizontalHeading = _stageContainer.querySelectorAll("." + _selectedCellHorizontalHeadingSyle);
		if(_selectedCellsHorizontalHeading && _selectedCellsHorizontalHeading.length) {
			let _numberOfSelectedCells = _selectedCellsHorizontalHeading.length;
			for(let _curCol = 0; _curCol < _numberOfSelectedCells; _curCol++) {
				_selectedCellsHorizontalHeading[_curCol].classList.remove(_selectedCellHorizontalHeadingSyle);
			}
		}

		let _selectedCellVerticalHeadingSyle = "SpreadSheet--vertical_heading_cell_selected";
		let _selectedCellsVerticalHeading = _stageContainer.querySelectorAll("." + _selectedCellVerticalHeadingSyle);
		if(_selectedCellsVerticalHeading && _selectedCellsVerticalHeading.length) {
			let _numberOfSelectedCells = _selectedCellsVerticalHeading.length;
			for(let _curRow = 0; _curRow < _numberOfSelectedCells; _curRow++) {
				_selectedCellsVerticalHeading[_curRow].classList.remove(_selectedCellVerticalHeadingSyle);
			}
		}
	}

 
	SpreadSheet.prototype.loadModules = function(modules) {
		if(modules && modules.constructor === Array) {
			let numberOfModulesToLoad = modules.length;

			for(let curModule = 0; curModule < numberOfModulesToLoad; curModule++) {
				let loadModuleEvent = new CustomEvent("useModule_" + modules[curModule], {
					detail: this, 
				});
				document.dispatchEvent(loadModuleEvent);
			}
		} else {
			throw new Error("Cannot load the specified modules.");
		}
	}

	return new SpreadSheet(parentElement, options);
}










































let HeadingsManager = (function() {
	let spreadsheet = null;
	let stage = null;
	let dataContainer = null;

	// 	Classes:
	let _CORNERWRAPPER 			= "SpreadSheet--corner_heading_wrapper",
		_CORNERTABLE 			= "SpreadSheet--corner_heading_table",
	 	_HORIZONTALWRAPPER 		= "SpreadSheet--horizontal_heading_wrapper",
	 	_HORIZONTALCONTAINER 	= "SpreadSheet--horizontal_heading_container",
	 	_HORIZONTALTABLE 		= "SpreadSheet--horizontal_heading_table",
	 	_VERTICALWRAPPER 		= "SpreadSheet--vertical_heading_wrapper",
	 	_VERTICALCONTAINER 		= "SpreadSheet--vertical_heading_container",
	 	_VERTICALTABLE 			= "SpreadSheet--vertical_heading_table",
	 	_TABLE 					= "SpreadSheet--table";


	document.addEventListener("useModule_headings", function(evt) {
		spreadsheet = evt.detail;
		if(spreadsheet instanceof SpreadSheet) {
			// 	We're good to go!
			stage = spreadsheet.stage;
			dataContainer = spreadsheet.dataContainer;
			createHeadings();
		} else {
			throw new Error("Cannot load the HeadingsManager module without a valid SpreadSheet argument.");
		}
	});

	function createHeadings() {
		let cornerHeading = stage.querySelector("." + _CORNERWRAPPER);
		if(!cornerHeading) {
			createCornerHeading();
		}

		let horizontalHeading = stage.querySelector("." + _HORIZONTALWRAPPER);
		if(!horizontalHeading) {
			createHorizontalHeading();
		}

		let verticalHeading = stage.querySelector("." + _VERTICALWRAPPER);
		if(!verticalHeading) {
			createVerticalHeading();
		}

		//	no no no, no es bueno... should fire an event and something else should update the position of the left_data_table_wrapper....
		let dataWrapper = dataContainer.querySelector(".SpreadSheet--left_data_table_wrapper");
		if(dataWrapper) {
			cornerHeading = stage.querySelector("." + _CORNERWRAPPER);
			let cornerHeadingBCR = cornerHeading.getBoundingClientRect();
			dataWrapper.style.cssText = "left: " + cornerHeadingBCR.width + "px; top: " + cornerHeadingBCR.height + "px";
		}
	}

	function createCornerHeading() {
		let wrapper = DOMManager.createDiv();
		wrapper.classList.add(_CORNERWRAPPER);

		let data = [];
		let row = [];
		let cell = {
			textContent: "network_cell",
		}
		row.push(cell);
		data.push(row);

		let table = DOMManager.createTableFromData(data);
		table.classList.add(_TABLE);
		table.classList.add(_CORNERTABLE);

		wrapper.appendChild(table);
		stage.appendChild(wrapper);
	}

	function createHorizontalHeading() {
		/**//////	Let's create the containers:
		/**//////		Since the SPREADSHEET may have a lot of columns,
		/**//////		the total width of the horizontal heading table
		/**//////		may be larger than the width of SPREADSHEET's
		/**//////		STAGE div.
		/**//////		As such, the horizontal heading table will be put 
		/**//////		inside an horizontally scrollable CONTAINER. This
		/**//////		CONTAINER will be put inside a WRAPPER which will
		/**//////		hide the CONTAINER's scrollbar.
		/**/	let wrapper = createContainers(_HORIZONTALWRAPPER, _HORIZONTALCONTAINER, true);
		/**/	let container = wrapper.children[0];

		/**//////	Let's make sure the scrolling behaviour is correct:
		/**//////		The WRAPPER will be a child of SPREADSHEET's
		/**//////		STAGE rather than DATACONTAINER. As such, by 
		/**//////		default, when scrolling the DATACONTAINER div the
		/**//////		CONTAINER will not scroll and we may end up in a
		/**//////		situation where, for example, the horizontal 
		/**////// 		heading table is showing columns A to J but the 
		/**//////		DATATABLE inside DATACONTAINER is actually showing 
		/**////// 		columns AE to AN.
		/**//////		Now, why is the WRAPPER a child of STAGE rather 
		/**//////		than DATACONTAINER? So that when the DATACONTAINER
		/**//////		is scrolled vertically, the horizontal heading 
		/**//////		doesn't disappear, i.e.: it will behave as a frozen
		/**//////		row.
		/**//////		The CONTAINER's scrollLeft value needs to be the
		/**//////		same as the SPREADSHEET's DATACONTAINER scrollLeft
		/**//////		value. 
		/**/	createScrollEvents(container, true);

		/**//////	Let's create the data aka the columns names:
		/**/	let textContent = function(curRow, curColumn) {
		/**/		return DataManager.convertNumberToColumnName(curColumn + 1)
		/**/	};
		/**/	let data = createData(1, spreadsheet.columns, textContent);

		/**//////	Let's create the actual HTML table element:
		/**/	let table = createTable(data, [_TABLE, _HORIZONTALTABLE], true);

		/**//////	Let's set the right DOM hierarchy:
		/**/	container.appendChild(table);
		/**/	stage.appendChild(wrapper);

		let createHorizontalHeadingEvent = new CustomEvent("createHorizontalHeading", {
			detail: {
				spreadsheet: spreadsheet,
				table: table,
			} 
		});
		document.dispatchEvent(createHorizontalHeadingEvent);
	}

	function createVerticalHeading() {
		/**//////	Let's create the containers:
		/**//////		Since the SPREADSHEET may have a lot of rows,
		/**//////		the total height of the vertical heading table
		/**//////		may be larger than the height of SPREADSHEET's
		/**//////		STAGE div.
		/**//////		As such, the vertical heading table will be put 
		/**//////		inside a vertically scrollable CONTAINER. This
		/**//////		CONTAINER will be put inside a WRAPPER which will
		/**//////		hide the CONTAINER's scrollbar.
		/**/	let wrapper = createContainers(_VERTICALWRAPPER, _VERTICALCONTAINER);
		/**/	let container = wrapper.children[0];

		/**//////	Let's make sure the scrolling behaviour is correct:
		/**//////		The WRAPPER will be a child of SPREADSHEET's
		/**//////		STAGE rather than DATACONTAINER. As such, by 
		/**//////		default, when scrolling the DATACONTAINER div the
		/**//////		CONTAINER will not scroll and we may end up in a
		/**//////		situation where, for example, the vertical 
		/**////// 		heading table is showing rows 1 to 100 but the 
		/**//////		DATATABLE inside DATACONTAINER is actually showing 
		/**////// 		rows 301 to 400.
		/**//////		Now, why is the WRAPPER a child of STAGE rather 
		/**//////		than DATACONTAINER? So that when the DATACONTAINER
		/**//////		is scrolled horizontally, the vertical heading 
		/**//////		doesn't disappear, i.e.: it will behave as a frozen
		/**//////		column.
		/**//////		The CONTAINER's scrollTop value needs to be the
		/**//////		same as the SPREADSHEET's DATACONTAINER scrollTop
		/**//////		value. 
		/**/	createScrollEvents(container);

		/**//////	Let's create the data aka the rows numbers:
		/**/	let textContent = function(curRow) {
		/**/		return curRow + 1;
		/**/	};
		/**/	let data = createData(spreadsheet.rows, 1, textContent);

		/**//////	Let's create the actual HTML table element:
		/**/	let table = createTable(data, [_TABLE, _VERTICALTABLE]);

		/**//////	Let's set the right DOM hierarchy:
		/**/	container.appendChild(table);
		/**/	stage.appendChild(wrapper);

		let createVerticalHeadingEvent = new CustomEvent("createVerticalHeading", {
			detail: {
				spreadsheet: spreadsheet,
				table: table,
			} 
		});
		document.dispatchEvent(createVerticalHeadingEvent);
	}

	function createContainers(wrapperClass, containerClass, horizontalHeading) {
		let wrapper = DOMManager.createDiv();
		wrapper.classList.add(wrapperClass);
	
		let cornerHeading = stage.querySelector("." + _CORNERWRAPPER);
		let cornerHeadingBCR = cornerHeading.getBoundingClientRect();
		if(horizontalHeading) {
			let widthCalc = cornerHeadingBCR.width + DOMManager.scrollbarSize.width;
			wrapper.style.cssText = "width: calc(100% - " + widthCalc + "px); left: " + cornerHeadingBCR.width + "px; height: " + cornerHeadingBCR.height + "px;";
		} else {
			let heightCalc = cornerHeadingBCR.height + DOMManager.scrollbarSize.height;
			wrapper.style.cssText = "height: calc(100% - " + heightCalc + "px); width: " + cornerHeadingBCR.width + "px; top: " + cornerHeadingBCR.height + "px;";
		}
	
		let container = DOMManager.createDiv();
		container.classList.add(containerClass);

		wrapper.appendChild(container);
		return wrapper;
	}

	function createData(numberOfRows, numberOfColumns, textContentCreationCallback) {
		let data = [];
		for(let curRow = 0; curRow < numberOfRows; curRow++) {
			let row = [];
			for(let curColumn = 0; curColumn < numberOfColumns; curColumn++) {
				let newCell = {
					textContent: textContentCreationCallback(curRow, curColumn, numberOfRows, numberOfColumns),
				}
				row.push(newCell);
			}
			data.push(row);
		}

		return data;
	}

	function createScrollEvents(container, scrollHorizontally) {
		let isSyncingDataContainer = false;
		let isSyncingContainer = false;
		dataContainer.addEventListener("scroll", function(evt) {
			if (!isSyncingDataContainer) {
				isSyncingContainer = true;
				if(scrollHorizontally) {
					container.scrollLeft = this.scrollLeft;
				} else {
					container.scrollTop = this.scrollTop;
				}
			}
	
			isSyncingDataContainer = false;
		});
	
		container.addEventListener("scroll", function(evt) {
			if (!isSyncingContainer) {
				isSyncingDataContainer = true;
				if(scrollHorizontally) {
					dataContainer.scrollLeft = this.scrollLeft;
				} else {
					dataContainer.scrollTop = this.scrollTop;
				}
			}
	
			isSyncingContainer = false;
		});
	}

	function createTable(data, tableClass, horizontalTable) {
		let table = DOMManager.createTableFromData(data);

		if(tableClass.constructor === Array) {
			let numberOfClasses = tableClass.length;
			for(let curClass = 0; curClass < numberOfClasses; curClass++) {
				table.classList.add(tableClass[curClass]);
			}
		} else if(tableClass.constructor === String) {
			table.classList.add(tableClass);
		} else {
			throw new Error("Cannot create an HTML table with the specified class.");
		}

		let cornerHeading = stage.querySelector("." + _CORNERWRAPPER);
		let cornerHeadingBCR = cornerHeading.getBoundingClientRect();
		if(horizontalTable) {
			table.style.cssText = "height: " + cornerHeadingBCR.height + "px";
		} else {
			table.style.cssText = "width: " + cornerHeadingBCR.width + "px";
		}

		return table;
	}
})();





























































let SelectionManager = (function() {
	// 	Private properties:
	let mouseDownTarget = new MouseTarget();
	let mouseUpTarget = new MouseTarget();
	let dataContainerInitialScrollTop = 0;
	let dataContainerInitialScrollLeft = 0;
	let windowInitialScrollTop = 0;
	let windowInitialScrollLeft = 0;
	let validSelection = false;
	let updateHighlighterCallback = null;
	let cellsHighlighter = document.createElement("div");
	cellsHighlighter.classList.add("SpreadSheet--cells_highlighter");
	let spreadsheet = null;

	document.addEventListener("useModule_selection", function(evt) {
		spreadsheet = evt.detail;
		if(spreadsheet instanceof SpreadSheet) {
			// 	We're good to go!
			createEventsListeners();
		} else {
			throw new Error("Cannot load the SelectionManager module without a valid SpreadSheet argument.");
		}
	});

	function createEventsListeners() {
		document.addEventListener("DOMContentLoaded", createHighlighter);
		document.addEventListener("createHorizontalHeading", setColumnSelectionEvents);
		document.addEventListener("createVerticalHeading", function(evt) {});

		document.addEventListener("createDataTable", setCellsSelectionEvents);
	}

	function createHighlighter(evt) {
		spreadsheet.dataContainer.appendChild(cellsHighlighter);

		// 	In case the Selection module is added after the Headings module, the createHorizontalHeading has already been fired and the Selection module didn't capture it, so we need to fake the firing of the event....
		let alreadyExistsHorizontalHeading = spreadsheet.stage.querySelector(".SpreadSheet--horizontal_heading_wrapper");
		if(alreadyExistsHorizontalHeading) {
			let createHorizontalHeadingEvent = new CustomEvent("createHorizontalHeading", {
				detail: {
					spreadsheet: spreadsheet,
					table: alreadyExistsHorizontalHeading.children[0],
				} 
			});

			setColumnSelectionEvents(createHorizontalHeadingEvent);
		}
	}

	function setColumnSelectionEvents(evt) {
		let topOffsetCalculation = function(mouseDownTarget, mouseUpTarget) {
			let top = mouseDownTarget.y + mouseDownTarget.height - spreadsheet.dataContainer.getBoundingClientRect().y;
			return top;
		}

		let leftOffsetCalculation = function(mouseDownTarget, mouseUpTarget) {
			let mouseDownTargetXPos = mouseDownTarget.x + windowInitialScrollLeft - window.scrollX + dataContainerInitialScrollLeft;
			let mouseUpTargetXPos = mouseUpTarget.x + spreadsheet.dataContainer.scrollLeft;			
			let left = (mouseDownTargetXPos < mouseUpTargetXPos) ? mouseDownTargetXPos : mouseUpTargetXPos;
			left -= spreadsheet.dataContainer.getBoundingClientRect().x + 1;
			return left;
		}

		let heightCalculation = function(mouseDownTarget, mouseUpTarget) {
			let height = spreadsheet.dataContainer.scrollHeight - evt.detail.table.getBoundingClientRect().height + 2;
			return height;
		}

		let widthCalculation = function(mouseDownTarget, mouseUpTarget) {
			let mouseDownTargetXPos = mouseDownTarget.x + windowInitialScrollLeft - window.scrollX + dataContainerInitialScrollLeft;
			let mouseUpTargetXPos = mouseUpTarget.x + spreadsheet.dataContainer.scrollLeft;
			let leftTarget = (mouseDownTargetXPos < mouseUpTargetXPos) ? mouseDownTarget : mouseUpTarget;
			let rightTarget = (leftTarget === mouseDownTarget) ? mouseUpTarget : mouseDownTarget;
			let width = Math.abs(mouseUpTargetXPos - mouseDownTargetXPos) + 3 + rightTarget.width;
			return width;
		}

		setGenericSelectionEvents(evt.detail.table, {
			top: topOffsetCalculation,
			left: leftOffsetCalculation,
			width: widthCalculation,
			height: heightCalculation,
		});
	}

	function setCellsSelectionEvents(evt) {
		let topOffsetCalculation = function(mouseDownTarget, mouseUpTarget) {
			let mouseDownTargetYPos = mouseDownTarget.y + windowInitialScrollTop - window.scrollY + dataContainerInitialScrollTop;
			let mouseUpTargetYPos = mouseUpTarget.y + spreadsheet.dataContainer.scrollTop;
			let topTarget = (mouseDownTargetYPos < mouseUpTargetYPos) ? mouseDownTarget : mouseUpTarget;
			let top = (topTarget === mouseDownTarget) ? mouseDownTargetYPos : mouseUpTargetYPos;
			top -= spreadsheet.dataContainer.getBoundingClientRect().y;
			return top;
		}

		let leftOffsetCalculation = function(mouseDownTarget, mouseUpTarget) {
			let mouseDownTargetXPos = mouseDownTarget.x + windowInitialScrollLeft - window.scrollX + dataContainerInitialScrollLeft;
			let mouseUpTargetXPos = mouseUpTarget.x + spreadsheet.dataContainer.scrollLeft;			
			let left = (mouseDownTargetXPos < mouseUpTargetXPos) ? mouseDownTargetXPos : mouseUpTargetXPos;
			left -= spreadsheet.dataContainer.getBoundingClientRect().x + 1;
			return left;
		}

		let heightCalculation = function(mouseDownTarget, mouseUpTarget) {
			let mouseDownTargetYPos = mouseDownTarget.y + windowInitialScrollTop - window.scrollY + dataContainerInitialScrollTop;
			let mouseUpTargetYPos = mouseUpTarget.y + spreadsheet.dataContainer.scrollTop;
			let topTarget = (mouseDownTargetYPos < mouseUpTargetYPos) ? mouseDownTarget : mouseUpTarget;
			let bottomTarget = (topTarget === mouseDownTarget) ? mouseUpTarget : mouseDownTarget;
			let height = Math.abs(mouseUpTargetYPos - mouseDownTargetYPos) + 3 + bottomTarget.height;
			return height;
		}

		let widthCalculation = function(mouseDownTarget, mouseUpTarget) {
			let mouseDownTargetXPos = mouseDownTarget.x + windowInitialScrollLeft - window.scrollX + dataContainerInitialScrollLeft;
			let mouseUpTargetXPos = mouseUpTarget.x + spreadsheet.dataContainer.scrollLeft;
			let leftTarget = (mouseDownTargetXPos < mouseUpTargetXPos) ? mouseDownTarget : mouseUpTarget;
			let rightTarget = (leftTarget === mouseDownTarget) ? mouseUpTarget : mouseDownTarget;
			let width = Math.abs(mouseUpTargetXPos - mouseDownTargetXPos) + 3 + rightTarget.width;
			return width;
		}

		setGenericSelectionEvents(evt.detail.table, {
			top: topOffsetCalculation,
			left: leftOffsetCalculation,
			width: widthCalculation,
			height: heightCalculation,
		});
	}

	function setGenericSelectionEvents(target, calculationsCallbacks) {
		let mouseDownCallback = mouseEventCallback.bind(null, mouseDownTarget, target, startUpdatingHighlighter, calculationsCallbacks);
		target.addEventListener("mousedown", mouseDownCallback);

		let mouseUpCallback = mouseEventCallback.bind(null, mouseUpTarget, target, resetHighlighter, calculationsCallbacks);
		target.addEventListener("mouseup", mouseUpCallback);
	}

	function mouseEventCallback(mouseTarget, target, eventCallback, calculationsCallbacks, evt) {
		evt.preventDefault();
		evt.stopPropagation();
		if(	evt.target && evt.target.tagName && 
		   (evt.target.tagName.toLowerCase() === "td" || evt.target.tagName.toLowerCase() === "th")) {

			if(evt.button === 0) {
				//	Valid target cell. Save it. 
				mouseTarget.target = evt.target;
				if(eventCallback) {
					eventCallback(target, calculationsCallbacks);
				}
			}
		}
	}

	function startUpdatingHighlighter(target, calculationsCallbacks) {
		if(validSelection) {
			return;
		}
		validSelection = true;
		dataContainerInitialScrollTop = spreadsheet.dataContainer.scrollTop;
		dataContainerInitialScrollLeft = spreadsheet.dataContainer.scrollLeft;
		windowInitialScrollTop = window.scrollY;
		windowInitialScrollLeft = window.scrollX;
		
		updateHighlighterCallback = mouseEventCallback.bind(null, mouseUpTarget, target, redrawHighlighter, calculationsCallbacks);
		document.addEventListener("mousemove", updateHighlighterCallback);

		// shall add document.addeventlistener "mouseup", to clean if the user moused up outside the table
		let mouseUpCallback = resetHighlighter.bind(null, target, calculationsCallbacks);
		document.addEventListener("mouseup", mouseUpCallback);
	}

	function resetHighlighter(target, calculationsCallbacks) {
		if(validSelection) {
			redrawHighlighter(target, calculationsCallbacks);
		}
		document.removeEventListener("mousemove", updateHighlighterCallback);
		document.removeEventListener("mouseup", resetHighlighter);
		validSelection = false;
	}

	function redrawHighlighter(target, calculationsCallbacks) {
		setTimeout(function() {		
			if(	mouseDownTarget.target.parentElement.parentElement === target ||
				mouseDownTarget.target.parentElement.parentElement.parentElement === target) {
					let leftOffset = calculationsCallbacks.left(mouseDownTarget, mouseUpTarget);
					let topOffset = calculationsCallbacks.top(mouseDownTarget, mouseUpTarget);
					let widthCalc = calculationsCallbacks.width(mouseDownTarget, mouseUpTarget);
					let heightCalc = calculationsCallbacks.height(mouseDownTarget, mouseUpTarget);

					cellsHighlighter.style.cssText += 	"width: " + widthCalc + "px; " + 
														"height: " + heightCalc + "px; " +
														"left: " + leftOffset + "px; " +
														"top: " + topOffset + "px; " +
														"visibility: visible";
			}	
		}, 0);
	}
})();


















































































let DataManager = {
	countColumns: function(data) {
		let _numberOfColumns = 0;
		let _maxNumberOfColumns = 0;
		if(data.constructor === Array && data.length > 0) {
			for(let _curRow = 0; _curRow < data.length; _curRow++) {
				_numberOfColumns = 0;
				if(data[_curRow].constructor === Array) {
					for(let _curCol = 0; _curCol < data[_curRow].length; _curCol++) {
						_numberOfColumns += 1;
						if('colspan' in data[_curRow][_curCol] && Number.isInteger(data[_curRow][_curCol].colspan)) {
							_numberOfColumns += data[_curRow][_curCol].colspan - 1;
						}
					}
				} else if(data[_curRow].constructor === Object && 'rowData' in data[_curRow]) {
					for(let _curCol = 0; _curCol < data[_curRow].rowData.length; _curCol++) {
						_numberOfColumns += 1;
						if('colspan' in data[_curRow].rowData[_curCol] && Number.isInteger(data[_curRow].rowData[_curCol].colspan)) {
							_numberOfColumns += data[_curRow].rowData[_curCol].colspan - 1;
						}
					}
				}

				if(_numberOfColumns > _maxNumberOfColumns) {
					_maxNumberOfColumns = _numberOfColumns;
				}
			}
		}

		return _maxNumberOfColumns;
	},

	convertNumberToColumnName: function(value) {
		let _columnName = "";
		for(let a = 1, b = 26; (value -= a) >= 0; a = b, b *= 26) {
			_columnName = String.fromCharCode(parseInt((value % b) / a) + 65) + _columnName;
		}
		
		return _columnName;
	}
};

































let DOMManager = (function() {
	let _scrollBarSize = {
		width: null,
		height: null,
	};

	function _createDiv() {
		let _div = document.createElement("div");
		return _div;
	}

	function _calculateScrollbarDimensions() {
		let _tempScrollContainer = _createDiv();
		_tempScrollContainer.style.cssText += "position: relative; top: 0;" + 
					"left: 0;width: 100%; height: 100%; overflow: scroll;" +
					"visibility: hidden; opacity: 0;"
		document.body.appendChild(_tempScrollContainer);

		let _tempScrollContainerBCR = _tempScrollContainer.getBoundingClientRect();
		_scrollBarSize.width = _tempScrollContainerBCR.width - _tempScrollContainer.clientWidth;
		_scrollBarSize.height = _tempScrollContainerBCR.height - _tempScrollContainer.clientHeight;

		document.body.removeChild(_tempScrollContainer);
	}

	// document.addEventListener("DOMContentLoaded", _calculateScrollbarDimensions);


	let DOMManager = {
		createDiv: _createDiv,

		get scrollbarSize() {
			if(_scrollBarSize.width === null) {
				_calculateScrollbarDimensions();
			}

			return _scrollBarSize;
		},

		createTableFromData: function(data) {
			/*
				data = {
					thead: [rowDataObj],
					tbody: [rowDataObj],
					tfoot: [rowDataObj],
				};
				OR
				data = [rowDataObj],
				rowDataObj = {
					height: 10,
					style: cssText,
					rowData: [cellDataObj],
				};
				or
				rowDataObj = [cellDataObj],
				cellDataObj = {
					textContent: 'text', ???
					innerHTML: '<b>me',
					colspan: 2,
					style: cssText,
				}
			*/

			if(!data) {
				throw new Error("Cannot create a table without data.");
			}



			let _table = document.createElement("table");
			let _numberOfColumns = DataManager.countColumns(data);
			let _createdColumns = 0;

			if(data.constructor === Array) {
				let _numberOfRows = data.length;
				for(let _curRow = 0; _curRow < _numberOfRows; _curRow++) {
					let _newRow = document.createElement("tr");
					_createdColumns = 0;
					if(data[_curRow].constructor === Array) {
						for(let _curCol = 0; _curCol < _numberOfColumns; _curCol++) {
							if(_createdColumns > _numberOfColumns) {
								continue;
							}
							let _newCell = null;
							if(_curRow === 0) {
								_newCell = document.createElement("th");
							} else {
								_newCell = document.createElement("td");
							}

							if(data[_curRow][_curCol]) {
								_newCell.textContent = data[_curRow][_curCol].textContent;
								if('colspan' in data[_curRow][_curCol] && Number.isInteger(data[_curRow][_curCol].colspan)) {
									_newCell.colSpan = data[_curRow][_curCol].colspan.toString();
									_createdColumns += data[_curRow][_curCol].colspan;
								}
							} else {
								_newCell.textContent = "";
							}

							_newRow.appendChild(_newCell);
							_createdColumns += 1;

						}
					} else if(data[_curRow].constructor === Object && 'rowData' in data[_curRow]) {
						for(let _curCol = 0; _curCol < _numberOfColumns; _curCol++) {
							if(_createdColumns > _numberOfColumns) {
								continue;
							}
							let _newCell = null;
							if(_curRow === 0) {
								_newCell = document.createElement("th");
							} else {
								_newCell = document.createElement("td");
							}

							if(data[_curRow].rowData[_curCol]) {
								_newCell.textContent = data[_curRow].rowData[_curCol].textContent;
								if('colspan' in data[_curRow].rowData[_curCol] && Number.isInteger(data[_curRow].rowData[_curCol].colspan)) {
									_newCell.colSpan = data[_curRow].rowData[_curCol].colspan.toString();
									_createdColumns += data[_curRow].rowData[_curCol].colspan;
								}
							} else {
								_newCell.textContent = "";
							}

							_newRow.appendChild(_newCell);
							_createdColumns += 1;
						}
					}
					_table.appendChild(_newRow);
				}
			}

			return _table;
		},

		createEmptyTable: function(rows, columns) {
			/*
				rows:
					- integer
					- object: {
						[header]: integer,
						[body]: integer,
						[footer]: integer,
					}
				columns:
					- integer
			*/


			if(!Number.isInteger(columns) || columns < 1) {
				throw new Error("The number of columns needs to be a positive integer number.");
			}


			if(!Number.isInteger(rows) && !(rows.constructor === Object)) {
				throw new Error("The number of rows needs to be defined as a positive integer number or as a rowsObject.");
			} else if(Number.isInteger(rows) && rows < 0) {
				throw new Error("The number of rows needs to be a positive integer number.");
			}

			let _createHeader = (rows.constructor === Object && 'header' in rows) ? true : false;
			let _createBody = (rows.constructor === Object && 'body' in rows) ? true : false;


			let _table = document.createElement("table");
			if(Number.isInteger(rows)) {
				let _tableCells = createCellsArray(rows, columns);
				_table.appendChild(_tableCells);
			} else {
				let _tableHeader = _createHeader ? document.createElement("thead") : null;
				let _tableBody = _createBody ? document.createElement("tbody") : null;
				if(_createHeader) {
					if(Number.isInteger(rows.header) && rows.header >= 0) {
						let _headerCells = createCellsArray(rows.header, columns, true);
						_tableHeader.appendChild(_headerCells);
						_table.appendChild(_tableHeader);
					} else {
						throw new Error("The number of rows of the table header needs to be a positive integer number.");
					}
				}

				if(_createBody) {
					if(Number.isInteger(rows.body) && rows.body >= 0) {
						let _bodyCells = createCellsArray(rows.body, columns);
						_tableBody.appendChild(_bodyCells);
						_table.appendChild(_tableBody);
					} else {
						throw new Error("The number of rows of the table body needs to be a positive integer number.");
					}
				}
			}



			function createCellsArray(numberOfRows, numberOfColumns, thCells) {
				let _fragment = document.createDocumentFragment();

				for(let _curRow = 0; _curRow < numberOfRows; _curRow++) {
					let _row = document.createElement("tr");

					for(let _curCol = 0; _curCol < numberOfColumns; _curCol++) {
						let _cell = thCells ? document.createElement("th") : document.createElement("td");
						_row.appendChild(_cell);
					}

					_fragment.appendChild(_row);
				}
				return _fragment;
			}

			return _table;
		},
	};

	return DOMManager;
})();



























function MouseTarget(targetElement) {
	// 	Private properties:
	let _targetElement = null;
	let _targetElementBCR = null;

	// 	Private methods:
	function parseTargetElement(targetEl) {
		if(targetEl) {
			_targetElement = targetEl;
			_targetElementBCR = _targetElement.getBoundingClientRect();
		}
	}

	// 	Constructor code:
	function MouseTarget(targetElement) {
		parseTargetElement(targetElement);
	}
	MouseTarget.prototype = Object.create(this.constructor.prototype);
	MouseTarget.prototype.constructor = MouseTarget;

	// 	Properties setters/getters:
	Object.defineProperty(MouseTarget.prototype, 'x', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.x : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'y', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.y : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'width', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.width : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'height', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.height : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'target', {
		get: function() { 
			return _targetElement ? _targetElement : null; 
		},
		set: function(newTarget) {
			parseTargetElement(newTarget);
		}
	});
	Object.defineProperty(MouseTarget.prototype, 'top', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.top : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'bottom', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.bottom : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'left', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.left : null; 
		},
	});
	Object.defineProperty(MouseTarget.prototype, 'right', {
		get: function() { 
			return _targetElementBCR ? _targetElementBCR.right : null; 
		},
	});

	return new MouseTarget(targetElement);
}
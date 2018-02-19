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

	let _defaultOptions = {
		modules: {
			cursor: true,
			resize: true,
			ribbon: true,
			selection: true,
			virtualization: true,
		},

		showHeadings: true,
		numberOfColumns: 50,
		numberOfRows: 50,
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
	function createHorizontalHeading() {
		// if querySelector.... not exists....
		let _data = [];
		let _row = [];
		let _columns = _defaultOptions.numberOfColumns;

		for(let _curCol = 1; _curCol <= _columns; _curCol++) {
			let _newCell = {
				textContent: DataManager.convertNumberToColumnName(_curCol),
			}
			_row.push(_newCell);
		}
		_data.push(_row);

		let _wrapper = DOMManager.createDiv();
		_wrapper.classList.add("SpreadSheet--horizontal_heading_wrapper");

		let _container = DOMManager.createDiv();
		_container.classList.add("SpreadSheet--horizontal_heading_container");


		let isSyncingDataContainer = false;
		let isSyncingContainer = false;

		_dataContainer.addEventListener("scroll", function(evt) {
			if (!isSyncingDataContainer) {
				isSyncingContainer = true;
				_container.scrollLeft = this.scrollLeft;
			}

			isSyncingDataContainer = false;
		});

		_container.onscroll = function() {
			if (!isSyncingContainer) {
				isSyncingDataContainer = true;
				_dataContainer.scrollLeft = this.scrollLeft;
			}

			isSyncingContainer = false;
		}



		let _headingTable = DOMManager.createTableFromData(_data);
		_headingTable.classList.add("SpreadSheet--table");
		_headingTable.classList.add("SpreadSheet--horizontal_heading_table");

		_container.appendChild(_headingTable);
		_wrapper.appendChild(_container);
		_stageContainer.appendChild(_wrapper);
	}
	function createVerticalHeading() {
		// if querySelector.... not exists....
		let _data = [];
		let _columns = 1;
		let _rows = _defaultOptions.numberOfRows;

		for(let _curRow = 1; _curRow <= _rows; _curRow++) {
			let _row = [];
			let _newCell = {
				textContent: _curRow,
			}
			_row.push(_newCell);
			_data.push(_row);
		}



		let _wrapper = DOMManager.createDiv();
		_wrapper.classList.add("SpreadSheet--vertical_heading_wrapper");

		let _container = DOMManager.createDiv();
		_container.classList.add("SpreadSheet--vertical_heading_container");

		let isSyncingDataContainer = false;
		let isSyncingContainer = false;

		_dataContainer.addEventListener("scroll", function(evt) {
			if (!isSyncingDataContainer) {
				isSyncingContainer = true;
				_container.scrollTop = this.scrollTop;
			}

			isSyncingDataContainer = false;
		});

		_container.onscroll = function() {
			if (!isSyncingContainer) {
				isSyncingDataContainer = true;
				_dataContainer.scrollTop = this.scrollTop;
			}

			isSyncingContainer = false;
		}

		let _headingTable = DOMManager.createTableFromData(_data);
		_headingTable.classList.add("SpreadSheet--table");
		_headingTable.classList.add("SpreadSheet--vertical_heading_table");

		_container.appendChild(_headingTable);
		_wrapper.appendChild(_container);
		_stageContainer.appendChild(_wrapper);
	}
	function createCornerHeading() {
		let _data = [];
		let _row = [];
		let _cell = {
			textContent: "network_cell",
		}
		_row.push(_cell);
		_data.push(_row);

		let _wrapper = DOMManager.createDiv();
		_wrapper.classList.add("SpreadSheet--corner_heading_wrapper");

		let _headingTable = DOMManager.createTableFromData(_data);
		_headingTable.classList.add("SpreadSheet--table");
		_headingTable.classList.add("SpreadSheet--corner_heading_table");

		_wrapper.appendChild(_headingTable);
		_stageContainer.appendChild(_wrapper);
	}
	function createHeadings() {
		let _horzHeading = _stageContainer.querySelector(".SpreadSheet--horizontal_heading_wrapper");
		if(!_horzHeading) {
			createHorizontalHeading();
		}

		let _vertHeading = _stageContainer.querySelector(".SpreadSheet--vertical_heading_wrapper");
		if(!_vertHeading) {
			createVerticalHeading();
		}

		let _cornerHeading = _stageContainer.querySelector(".SpreadSheet--corner_heading_wrapper");
		if(!_cornerHeading) {
			createCornerHeading();
		}

	}







	// 	Constructor code:
	function SpreadSheet(parentElement, options) {
		parseContainer.call(this, parentElement);
		_userOptions = options;
		
		this.setSelectionModule();
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


	SpreadSheet.prototype.createEmptySheet = function() {
		createHorizontalHeading();
		createHeadings();

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


		let _table = DOMManager.createEmptyTable(_rows, _numberOfColumns);
		_table.classList.add("SpreadSheet--table");
		_table.classList.add("SpreadSheet--data_table");
		_dataTables.push(_table);

		_dataTablesChangedEvent = new CustomEvent('dataTablesChanged', {
			detail: this, 
		});
		document.dispatchEvent(_dataTablesChangedEvent);
		_dataContainer.appendChild(_table);
	}


	SpreadSheet.prototype.createSheetFromData = function(data) {
		createVerticalHeading();
		createHorizontalHeading();
		createCornerHeading();

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
 


	





	SpreadSheet.prototype.setSelectionModule = function() {
		let _useModule = (_userOptions && 'modules' in _userOptions && 'selection' in _userOptions.modules) ? 
							_userOptions.modules.selection : _defaultOptions.modules.selection;
		if(_useModule) {
			_selectionManager = new SelectedCellsManager(this);
		}
	}

	return new SpreadSheet(parentElement, options);
}


























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




































let DOMManager = {
	createDiv: function() {
		let _div = document.createElement("div");
		return _div;
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












function SelectedCellsManager(SpreadSheet) {
	// 	Private properties:
	let _mouseDownTarget = new MouseTarget();
	let _mouseUpTarget = new MouseTarget();
	let _dataContainerInitialScrollTop = 0;
	let _dataContainerInitialScrollLeft = 0;
	let _windowInitialScrollTop = 0;
	let _windowInitialScrollLeft = 0;
	let _validSelection = false;
	let _updateHighlighterCallback = null;
	let _cellsHighlighter = document.createElement("div");
	_cellsHighlighter.classList.add("cellsHighlighter");

	// 	Private methods:
	function isValidSpreadSheet() {
		if('dataContainer' in SpreadSheet) {
			return true;
		} else {
			return false;
		}
	}

	function setCellSelectionEvents(dataTables) {
		let _qtyDataTables = 0;
		if(dataTables && dataTables.constructor === Array) {
			_qtyDataTables = dataTables.length;
		}
		for(let _curTable = 0; _curTable < _qtyDataTables; _curTable++) {
			let mouseDownCallback = mouseEventCallback.bind(null, _mouseDownTarget, startUpdatingHighlighter);
			dataTables[_curTable].addEventListener("mousedown", mouseDownCallback);

			let mouseUpCallback = mouseEventCallback.bind(null, _mouseUpTarget, resetHighlighter);
			dataTables[_curTable].addEventListener("mouseup", mouseUpCallback);
		}
	}

	function startUpdatingHighlighter() {
		if(_validSelection) {
			return;
		}
		_validSelection = true;
		_dataContainerInitialScrollTop = SpreadSheet.dataContainer.scrollTop;
		_dataContainerInitialScrollLeft = SpreadSheet.dataContainer.scrollLeft;
		_windowInitialScrollTop = window.scrollY;
		_windowInitialScrollLeft = window.scrollX;
		
		_updateHighlighterCallback = mouseEventCallback.bind(null, _mouseUpTarget, redrawHighlighter);
		document.addEventListener("mousemove", _updateHighlighterCallback);

		// shall add document.addeventlistener "mouseup", to clean if the user moused up outside the table
		document.addEventListener("mouseup", resetHighlighter);
	}

	function resetHighlighter(evt) {
		if(_validSelection) {
			redrawHighlighter();
		}
		document.removeEventListener("mousemove", _updateHighlighterCallback);
		document.removeEventListener("mouseup", resetHighlighter);
		_validSelection = false;
	}

	function mouseEventCallback(mouseTarget, eventCallback, evt) {
		evt.preventDefault();
		evt.stopPropagation();
		let _validTable = false;
		if(	evt.target && evt.target.tagName && 
		   (evt.target.tagName.toLowerCase() === "td" || 
			evt.target.tagName.toLowerCase() === "th")) {

			for(let _curTable = 0; _curTable < SpreadSheet.dataTables.length; _curTable++) {
				if(	evt.target.parentElement.parentElement === SpreadSheet.dataTables[_curTable] ||
					evt.target.parentElement.parentElement.parentElement === SpreadSheet.dataTables[_curTable]) {
					_validTable = true;
				}
			}

			// if(evt.target.parentElement.parentElement)

			if(evt.button === 0 && _validTable) {
				//	Valid target cell. Save it. 
				mouseTarget.target = evt.target;
				if(eventCallback) {
					eventCallback(evt);
				}
			}
		}
	}

	function redrawHighlighter() {
		setTimeout(function() {
			let _containerBCR = SpreadSheet.dataContainer.getBoundingClientRect();

			let mouseDownTargetYPos = _mouseDownTarget.y + _windowInitialScrollTop - window.scrollY + _dataContainerInitialScrollTop;
			let mouseDownTargetXPos = _mouseDownTarget.x + _windowInitialScrollLeft - window.scrollX + _dataContainerInitialScrollLeft;
			let mouseUpTargetYPos = _mouseUpTarget.y + SpreadSheet.dataContainer.scrollTop;
			let mouseUpTargetXPos = _mouseUpTarget.x + SpreadSheet.dataContainer.scrollLeft;

			let leftTarget = (mouseDownTargetXPos < mouseUpTargetXPos) ? _mouseDownTarget : _mouseUpTarget;
			let rightTarget = (leftTarget === _mouseDownTarget) ? _mouseUpTarget : _mouseDownTarget;
			let topTarget = (mouseDownTargetYPos < mouseUpTargetYPos) ? _mouseDownTarget : _mouseUpTarget;
			let bottomTarget = (topTarget === _mouseUpTarget) ? _mouseDownTarget : _mouseUpTarget;
			
			let leftOffset = (mouseDownTargetXPos < mouseUpTargetXPos) ? mouseDownTargetXPos : mouseUpTargetXPos;
			leftOffset -= _containerBCR.x + 1;
			let widthCalc = Math.abs(mouseUpTargetXPos - mouseDownTargetXPos) + 3 + rightTarget.width;
			let topOffset = (mouseDownTargetYPos < mouseUpTargetYPos) ? mouseDownTargetYPos : mouseUpTargetYPos;
			topOffset -= _containerBCR.y + 1;
			let heightCalc = Math.abs(mouseUpTargetYPos - mouseDownTargetYPos) + 3 + bottomTarget.height;
			_cellsHighlighter.style.cssText += 	"width: " + widthCalc + "px; " + 
												"height: " + heightCalc + "px; " +
												"left: " + leftOffset + "px; " +
												"top: " + topOffset + "px; " +
												"visibility: visible";
		}, 0);
	}

	// 	Constructor code:
	function SelectedCellsManager(SpreadSheet) {
		if(isValidSpreadSheet(SpreadSheet)) {
			SpreadSheet.dataContainer.appendChild(_cellsHighlighter);
			
			document.addEventListener('dataTablesChanged', function(evt) {
				if(evt.detail === SpreadSheet) {
					setCellSelectionEvents(SpreadSheet.dataTables);
				}
			});
		}
	}
	SelectedCellsManager.prototype = Object.create(this.constructor.prototype);
	SelectedCellsManager.prototype.constructor = SelectedCellsManager;

	return new SelectedCellsManager(SpreadSheet);
}
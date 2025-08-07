// Lista de cursos por defecto
let courseLabels = [
	"Introducción a las Matemáticas (Pre-Cálculo)",
	"Cálculo I",
	"Cálculo II",
	"Cálculo Avanzado",
	"Análisis Real",
	"Ecuaciones Diferenciales Parciales",
	"Teoría de la Medida",
	"Ecuaciones Diferenciales Ordinarias",
	"Análisis Complejo",
	"Análisis Numérico",
	"Matemáticas Discretas",
	"Álgebra",
	"Álgebra Lineal",
	"Álgebra Avanzada",
	"Optimización",
	"Álgebra Abstracta I",
	"Algebra Abstracta II",
	"Probabilidades",
	"Inferencia Estadística",
	"Procesos Estocásticos",
	"Programación I (Bioinformática) o Programación Estructurada (Videojuegos)",
	"Programación Avanzada (Bioinformática) o Programación orientada a objetos (Videojuegos)",
	"Algoritmos y Estructuras de Datos (Bioinformática)",
	"Bases de Datos (Bioinformática)",
	"Minería de Datos (Bioinformática)",
	"Visualización y Comunicación de Datos",
	"Introducción a la Ingeniería Matemática",
	"Laboratorio?",
	"Modelamiento Matemático",
	"Física General (Bioinformática)",
	"Electricidad y Magnetismo (Bioinformática)",
	"Ing. Económica y Evaluación de Proyectos (Ingeniería)",
	"Otro curso o un electivo?",
	"Electivo I",
	"Electivo II",
	"Electivo III",
	"Electivo IV",
	"Proyecto de titulo",
	"Trabajo de titulo",
	"Formacion fundamental I",
	"Formacion fundamental II",
	"Formacion fundamental III",
	"Formacion fundamental IV",
	"Idioma I",
	"Idioma II",
	"Idioma III",
	"Idioma IV",
	"Minor I",
	"Minor II",
	"Minor III",
	"Minor IV"
];

// Colores por semestre
const semesterColors = {
	0: '#6bb1f8', // No asignado (azul claro)
	1: '#FF9AA2', // Semestre 1 (rojo claro)
	2: '#FFB7B2', // Semestre 2 (rojo más claro)
	3: '#FFDAC1', // Semestre 3 (naranja claro)
	4: '#E2F0CB', // Semestre 4 (verde claro)
	5: '#B5EAD7', // Semestre 5 (verde agua)
	6: '#C7CEEA', // Semestre 6 (azul lavanda)
	7: '#A2D7D8', // Semestre 7 (turquesa)
	8: '#A5BAD7', // Semestre 8 (verde menta)
	9: '#D8B5FF', // Semestre 9 (lavanda)
	10: '#BB9AA2' // Semestre 10 (igual al 1 para completar)
};

// Nombres de semestres para la leyenda
const semesterNames = {
	0: "No asignado",
	1: "Semestre 1",
	2: "Semestre 2",
	3: "Semestre 3",
	4: "Semestre 4",
	5: "Semestre 5",
	6: "Semestre 6",
	7: "Semestre 7",
	8: "Semestre 8",
	9: "Semestre 9",
	10: "Semestre 10"
};

// Variables globales
let elements = [];
let cy;
let selectedNode = null;
let currentlyEditingNode = null;
const COLUMNS = 11;
const ROWS = 1;
const COLUMN_WIDTH = 150;
const ROW_HEIGHT = 150;

function formatDescriptionText(text) {
	if (!text) return '';
	// Convertir saltos de línea en <br> y mantener múltiples espacios
	return text.replace(/\n/g, '<br>');
}

// Función para crear la leyenda de colores
function createColorLegend() {
	const container = document.getElementById('legend-items-container');
	container.innerHTML = '';

	// Ordenar los semestres (0 al final)
	const sortedSemesters = Object.keys(semesterColors)
		.map(Number)
		.sort((a, b) => {
			if (a === 0) return 1;
			if (b === 0) return -1;
			return a - b;
		});

	sortedSemesters.forEach(semester => {
		const item = document.createElement('div');
		item.className = 'legend-item';

		const colorBox = document.createElement('div');
		colorBox.className = 'legend-color';
		colorBox.style.backgroundColor = semesterColors[semester];

		const label = document.createElement('span');
		label.textContent = semesterNames[semester];

		item.appendChild(colorBox);
		item.appendChild(label);
		container.appendChild(item);
	});
}

// Función para dibujar la cuadrícula de fondo
function drawGrid() {
	const canvas = document.getElementById('grid-canvas');
	const ctx = canvas.getContext('2d');
	const width = canvas.width = canvas.offsetWidth;
	const height = canvas.height = canvas.offsetHeight;

	ctx.clearRect(0, 0, width, height);
	ctx.strokeStyle = '#e0e0e0';
	ctx.lineWidth = 1;
	/*
		// Dibujar líneas verticales (columnas)
		for (let i = 0; i <= COLUMNS; i++) {
			const x = i * (width / COLUMNS);
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
		}

		// Dibujar líneas horizontales (filas)
		for (let i = 0; i <= ROWS; i++) {
			const y = i * (height / ROWS);
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
	*/
}

// Inicializar el gráfico
function initializeGraph() {
	// Redibujar la cuadrícula
	drawGrid();

	// Volver a dibujar cuando cambie el tamaño
	window.addEventListener('resize', drawGrid);

	// Limpiar gráfico existente
	if (cy) {
		cy.destroy();
	}

	// Crear nodos con posiciones en cuadrícula de 10 columnas
	elements = [];

	courseLabels.forEach((label, index) => {
		const row = Math.floor(index / COLUMNS);
		const col = index % COLUMNS;
		const id = 'n' + index;

		elements.push({
			data: {
				id,
				label,
				title: label, // Inicialmente el título es igual al label
				semester: 0, // Semestre no asignado por defecto
				description: "" // Descripción vacía por defecto
			},
			position: {
				x: col * COLUMN_WIDTH + 100,
				y: row * ROW_HEIGHT + 100
			}
		});
	});

	cy = cytoscape({
		container: document.getElementById('cy'),
		elements: elements,
		style: [{
				selector: 'node',
				style: {
					'label': 'data(title)',
					'text-valign': 'center',
					'text-halign': 'center',
					'text-wrap': 'wrap',
					'text-max-width': '110px',
					'background-color': 'data(color)',
					'shape': 'roundrectangle',
					'width': 'label',
					'height': 'label',
					'padding': '12px',
					'font-size': '13px',
					'border-width': '0px',
					'border-color': '#f00'
				}
			},
			{
				selector: 'node:selected',
				style: {
					'background-color': '#f55',
					'border-width': '3px'
				}
			},
			{
				selector: 'edge',
				style: {
					'width': 2,
					'line-color': '#aaa',
					'target-arrow-color': '#aaa',
					'target-arrow-shape': 'triangle',
					'curve-style': 'bezier',
					'label': 'data(label)',
					'text-rotation': 'autorotate',
					'text-margin-x': '10px',
					'text-margin-y': '10px',
					'font-size': '10px'
				}
			}
		],
		layout: {
			name: 'preset'
		},
		userZoomingEnabled: false
	});

	// Asignar colores iniciales basados en semestre
	cy.nodes().forEach(node => {
		updateNodeColor(node);
	});

	// Lógica para crear conexiones
	cy.on('tap', 'node', function(evt) {
		const node = evt.target;
		if (!selectedNode) {
			selectedNode = node;
			node.addClass('selected');
		} else if (selectedNode === node) {
			selectedNode.removeClass('selected');
			selectedNode = null;
		} else {
			cy.add({
				group: 'edges',
				data: {
					source: selectedNode.id(),
					target: node.id(),
				}
			});
			selectedNode.removeClass('selected');
			selectedNode = null;
		}
	});

	// Eliminar conexión al hacer clic
	cy.on('tap', 'edge', function(evt) {
		evt.target.remove();
	});

	// Editar nodo al hacer doble clic
	cy.on('dbltap', 'node', function(evt) {
		const node = evt.target;
		currentlyEditingNode = node;
		const editor = document.getElementById('node-editor');
		document.getElementById('node-edit-title').value = node.data('title');
		document.getElementById('node-edit-semester').value = node.data('semester') || 0;
		document.getElementById('node-edit-description').value = node.data('description') || '';

		// Posicionar editor cerca del nodo
		const nodePos = node.renderedPosition();
		editor.style.position = 'fixed';
		editor.style.left = '50%';
		editor.style.top = '50%';
		editor.style.transform = 'translate(-50%, -50%)';
		editor.style.display = 'block';
		/*
		editor.style.left = (nodePos.x + 20) + 'px';
		editor.style.top = (nodePos.y + 20) + 'px';
		editor.style.display = 'block';
    */

		// Enfocar el primer campo
		document.getElementById('node-edit-title').focus();
	});

	// Mostrar tooltip con descripción al pasar el mouse
	cy.on('mouseover', 'node', function(evt) {
		const node = evt.target;
		const description = node.data('description');
		if (description && description.trim() !== '') {
			const tooltip = document.getElementById('tooltip');
			const formattedDesc = formatDescriptionText(description);
			tooltip.innerHTML = `<strong>${node.data('title')}</strong><br>${formattedDesc}`;
			tooltip.style.display = 'block';

			// Actualizar posición mientras el mouse se mueve
			cy.on('mousemove', function(e) {
				if (e.originalEvent) {
					tooltip.style.left = (e.originalEvent.clientX + 10) + 'px';
					tooltip.style.top = (e.originalEvent.clientY + 10) + 'px';
				}
			});
		}
	});

	// Ocultar tooltip al quitar el mouse
	cy.on('mouseout', 'node', function() {
		document.getElementById('tooltip').style.display = 'none';
		cy.off('mousemove');
	});
}

// Actualizar color del nodo basado en el semestre
function updateNodeColor(node) {
	const semester = node.data('semester') || 0;
	node.data('color', semesterColors[semester]);
}

// Inicializar el gráfico y la leyenda
initializeGraph();
createColorLegend();

// Funciones para editar nodos
function saveNodeEdit() {
	if (currentlyEditingNode) {
		const newTitle = document.getElementById('node-edit-title').value;
		const newSemester = parseInt(document.getElementById('node-edit-semester').value);
		const newDescription = document.getElementById('node-edit-description').value;

		currentlyEditingNode.data('title', newTitle);
		currentlyEditingNode.data('semester', newSemester);
		currentlyEditingNode.data('description', newDescription);

		// Actualizar el label (texto visible) con el título
		currentlyEditingNode.data('label', newTitle);

		// Actualizar color basado en semestre
		updateNodeColor(currentlyEditingNode);

		cancelNodeEdit();
	}
}

function cancelNodeEdit() {
	document.getElementById('node-editor').style.display = 'none';
	currentlyEditingNode = null;
}

// Editar lista de cursos
function showCourseListEditor() {
	const editor = document.getElementById('course-list-editor');
	document.getElementById('course-list-textarea').value = courseLabels.join('\n');
	editor.style.display = 'block';
}

function updateCoursesFromText() {
	const newText = document.getElementById('course-list-textarea').value;
	courseLabels = newText.split('\n').filter(line => line.trim() !== '');
	document.getElementById('course-list-editor').style.display = 'none';
	initializeGraph();
}

// Cambiar disposición
function changeLayout() {
	const layoutName = document.getElementById('layout-selector').value;
	if (layoutName === 'preset') {
		cy.nodes().positions(function(node) {
			return node.position();
		});
		return;
	}

	cy.layout({
		name: layoutName,
		animate: true,
		animationDuration: 500
	}).run();
}

// Exportar conexiones
function downloadEdges() {
	const edges = cy.edges().map(edge => ({
		source: cy.getElementById(edge.data('source')).data('title'),
		target: cy.getElementById(edge.data('target')).data('title'),
		relationship: edge.data('label')
	}));

	const blob = new Blob([JSON.stringify(edges, null, 2)], {
		type: "application/json"
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "conexiones_cursos.json";
	a.click();
	URL.revokeObjectURL(url);
}

// Exportar mapa completo
function exportFullGraph() {
	const graphData = {
		nodes: cy.nodes().map(node => ({
			id: node.id(),
			title: node.data('title'),
			semester: node.data('semester'),
			description: node.data('description'),
			position: node.position()
		})),
		edges: cy.edges().map(edge => ({
			source: edge.data('source'),
			target: edge.data('target'),
			label: edge.data('label')
		})),
		courseLabels: courseLabels
	};

	const blob = new Blob([JSON.stringify(graphData, null, 2)], {
		type: "application/json"
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "nueva_malla_curricular.json";
	a.click();
	URL.revokeObjectURL(url);
}

// Guardar en el navegador
function saveGraph() {
	const graphData = {
		nodes: cy.nodes().map(node => ({
			id: node.id(),
			title: node.data('title'),
			semester: node.data('semester'),
			description: node.data('description'),
			position: node.position()
		})),
		edges: cy.edges().map(edge => ({
			source: edge.data('source'),
			target: edge.data('target'),
			label: edge.data('label')
		})),
		courseLabels: courseLabels
	};

	localStorage.setItem('courseGraphComplete', JSON.stringify(graphData));
	alert('¡Mapa guardado en el navegador!');
}

// Cargar desde el navegador
function loadGraph() {
	const saved = localStorage.getItem('courseGraphComplete');
	if (saved) {
		const graphData = JSON.parse(saved);
		if (graphData.courseLabels) {
			courseLabels = graphData.courseLabels;
		}
		loadGraphData(graphData);
		alert('¡Mapa cargado desde el navegador!');
	} else {
		alert('¡No se encontró ningún mapa guardado en el navegador!');
	}
}

// Importar archivo
document.getElementById('file-input').addEventListener('change', function(e) {
	const file = e.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function(e) {
		try {
			const graphData = JSON.parse(e.target.result);
			if (graphData.courseLabels) {
				courseLabels = graphData.courseLabels;
			}
			loadGraphData(graphData);
			alert('¡Mapa importado correctamente!');
		} catch (error) {
			alert('Error al importar: ' + error.message);
		}
	};
	reader.readAsText(file);
});

// Cargar mapa predeterminado del servidor
function loadServerGraph() {
	showLoading(true);
	fetch('malla-default.json')
		.then(response => {
			if (!response.ok) throw new Error('Error en la respuesta del servidor');
			return response.json();
		})
		.then(graphData => {
			if (graphData.courseLabels) {
				courseLabels = graphData.courseLabels;
			}
			loadGraphData(graphData);
			alert('¡Mapa predeterminado cargado desde el servidor!');
		})
		.catch(error => {
			alert('Error al cargar del servidor: ' + error.message);
			initializeGraph();
		})
		.finally(() => showLoading(false));
}

// Función para cargar datos del gráfico
function loadGraphData(graphData) {
	if (graphData.courseLabels) {
		courseLabels = graphData.courseLabels;
	}

	initializeGraph();

	if (graphData.nodes) {
		graphData.nodes.forEach(node => {
			const cyNode = cy.getElementById(node.id);
			if (cyNode) {
				// Actualizar todos los atributos del nodo
				cyNode.data('title', node.title || node.label || '');
				cyNode.data('semester', node.semester || 0);
				cyNode.data('description', node.description || '');
				cyNode.data('label', node.title || node.label || '');

				// Actualizar posición si existe
				if (node.position) {
					cyNode.position(node.position);
				}

				// Actualizar color basado en semestre
				updateNodeColor(cyNode);
			}
		});
	}

	if (graphData.edges) {
		graphData.edges.forEach(edge => {
			cy.add({
				group: 'edges',
				data: {
					source: edge.source,
					target: edge.target,
					label: edge.label
				}
			});
		});
	}

	cy.layout({
		name: 'preset'
	}).run();
}

// Limpiar conexiones
function clearGraph() {
	if (confirm('¿Estás seguro de que quieres eliminar todas las conexiones?')) {
		cy.edges().remove();
	}
}

// Reiniciar posiciones a la cuadrícula de 10 columnas
function resetNodePositions() {
	if (confirm('¿Restablecer todas las posiciones a la cuadrícula predeterminada?')) {
		cy.nodes().forEach((node, index) => {
			const row = Math.floor(index / COLUMNS);
			const col = index % COLUMNS;
			node.position({
				x: col * COLUMN_WIDTH + 100,
				y: row * ROW_HEIGHT + 100
			});
		});

		cy.layout({
			name: 'preset'
		}).run();
	}
}

// Mostrar indicador de carga
function showLoading(show) {
	document.getElementById('loading-indicator').style.display = show ? 'inline-block' : 'none';
}

// Al cargar la página: intentar cargar del navegador primero, luego del servidor
window.addEventListener('load', function() {
	const saved = localStorage.getItem('courseGraphComplete');
	if (saved) {
		loadGraph();
	} else {
		loadServerGraph();
	}
});

let newNodeCount = 0;

function addNewNode() {
	// Crear un ID único para el nuevo nodo
	const id = 'new' + newNodeCount++;

	// Crear la posición para el nuevo nodo
	const position = {
		x: 100 + (cy.nodes().length % COLUMNS) * COLUMN_WIDTH,
		y: 100 + Math.floor(cy.nodes().length / COLUMNS) * ROW_HEIGHT
	};

	// Agregar el nodo al gráfico
	const newNode = cy.add({
		group: 'nodes',
		data: {
			id: id,
			title: "Nuevo Curso",
			semester: 0,
			description: "",
			label: "Nuevo Curso",
			color: semesterColors[0]
		},
		position: position
	});

	// Actualizar el color del nuevo nodo
	updateNodeColor(newNode);
}

function deleteNode() {
	if (currentlyEditingNode) {
		const nodeTitle = currentlyEditingNode.data('title');
		if (confirm(`¿Seguro que deseas eliminar el curso "${nodeTitle}"?`)) {
			cy.remove(currentlyEditingNode);
			cancelNodeEdit();
		}
	}
}

async function exportToPDF() {
	const {
		jsPDF
	} = window.jspdf;

	const pageWidth = 792; // 11 * 72 (pt)
	const pageHeight = 612; // 8.5 * 72 (pt)
	const logoHeight = 50;
	const logoWidth = 89;
	const logoMargin = 20;

	// Cargar logo
	const logoImg = new Image();
	logoImg.src = 'logo.png'; // o base64 (data:image/png;base64,...)
	await logoImg.decode();

	// Exporta la imagen desde Cytoscape directamente (mejor que html2canvas)
	const imgData = cy.png({
		scale: 1, // alta resolución
		full: true,
		bg: "#ffffff",
		output: 'base64uri'
	});

	const pdf = new jsPDF({
		orientation: 'landscape',
		unit: 'pt',
		format: [pageWidth, pageHeight]
	});

	// Crea una imagen para obtener dimensiones reales
	const img = new Image();
	img.src = imgData;

	await new Promise(resolve => {
		img.onload = () => resolve();
	});

	// Ajusta tamaño de imagen
	let imgWidth = pageWidth - 40;
	let imgHeight = (img.height * imgWidth) / img.width;
	if (imgHeight > pageHeight - 40) {
		imgHeight = pageHeight - 40;
		imgWidth = (img.width * imgHeight) / img.height;
	}

	// Página 1: Título y grafo centrado
	pdf.setFontSize(20);
	pdf.setFont('helvetica', 'bold');
	const title = "Malla Curricular";
	const titleWidth = pdf.getTextWidth(title);
	pdf.text(title, (pageWidth - titleWidth) / 2, 40); // centrado a y = 40

	// Logo en esquina superior derecha
	pdf.addImage(
		logoImg,
		'PNG',
		pageWidth - logoWidth - logoMargin, // x
		logoMargin, // y
		logoWidth, // width
		logoHeight // height
	);

	// Imagen del grafo
	const topMargin = 60;
	const availableHeight = pageHeight - topMargin - 20;

	pdf.addImage(
		imgData,
		'PNG',
		(pageWidth - imgWidth) / 2,
		topMargin + ((availableHeight - imgHeight) / 2),
		imgWidth,
		imgHeight,
		undefined,
		'NONE'
	);


	// --- Páginas siguientes: lista de cursos + logo ---
	pdf.setFont('helvetica', 'normal');
	const cursosPorSemestre = {};
	cy.nodes().forEach(node => {
		const semestre = node.data('semester') || 0;
		if (!cursosPorSemestre[semestre]) cursosPorSemestre[semestre] = [];
		cursosPorSemestre[semestre].push({
			title: node.data('title'),
			description: node.data('description') || ''
		});
	});

	const semestresOrdenados = Object.keys(semesterNames).map(Number).filter(s => cursosPorSemestre[s] && cursosPorSemestre[s].length);

	semestresOrdenados.forEach(semestre => {
		pdf.addPage();

		// Logo en esquina superior derecha
		pdf.addImage(
			logoImg,
			'PNG',
			pageWidth - logoWidth - logoMargin, // x
			logoMargin, // y
			logoWidth, // width
			logoHeight // height
		);

		pdf.setFontSize(18);
		pdf.text(semesterNames[semestre], 40, 40);

		let y = 70;
		pdf.setFontSize(13);
		cursosPorSemestre[semestre].forEach(curso => {
			pdf.text(`• ${curso.title}`, 50, y);
			y += 18;
			if (curso.description) {
				const descLines = pdf.splitTextToSize(curso.description, pageWidth - 100);
				descLines.forEach(line => {
					pdf.text(line, 70, y);
					y += 14;
				});
			}
			y += 10;
			if (y > pageHeight - 40) {
				pdf.addPage();

				// Logo en nueva página
				pdf.addImage(logoImg, 'PNG',
					pageWidth - logoSize - logoMargin,
					logoMargin,
					logoSize,
					logoSize
				);

				y = 40;
			}
		});
	});

	pdf.save('malla_curricular.pdf');
}
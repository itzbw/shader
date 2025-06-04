const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
let currentMode = 0;

let program;
let timeLocation, resolutionLocation, mouseLocation, modeLocation;
let mouseX = 0,
  mouseY = 0;
let frameCount = 0;
let lastTime = performance.now();
let startTime = performance.now();

function setMode(mode) {
  currentMode = mode;
  for (let i = 0; i < 3; i++) {
    document.getElementById("btn" + i).classList.toggle("active", i === mode);
  }
}

if (!gl) {
  document.body.innerHTML =
    '<div class="error">WebGL not supported in your browser</div>';
}

async function loadShader(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load shader: ${url}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error loading shader:", error);
    throw error;
  }
}

function compileShader(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

async function initializeShaders() {
  try {
    const vertexShaderSource = await loadShader("shaders/vertex.glsl");
    const fragmentShaderSource = await loadShader("shaders/crystalline.frag");

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(
      fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );

    if (!vertexShader || !fragmentShader) {
      throw new Error("Shader compilation failed");
    }

    // Create and link program
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      throw new Error("Program linking failed");
    }

    // Set up geometry
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    timeLocation = gl.getUniformLocation(program, "t");
    resolutionLocation = gl.getUniformLocation(program, "r");
    mouseLocation = gl.getUniformLocation(program, "m");
    modeLocation = gl.getUniformLocation(program, "mode");

    // Hide loading indicator
    document.getElementById("loading").style.display = "none";

    // Start the render loop
    render();
  } catch (error) {
    document.body.innerHTML = `<div class="error">Failed to initialize shaders: ${error.message}<br>Make sure the shader files are in the 'shaders/' directory</div>`;
  }
}

// Event listeners
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = rect.height - (e.clientY - rect.top);
});

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  if (mouseX === 0 && mouseY === 0) {
    mouseX = canvas.width / 2;
    mouseY = canvas.height / 2;
  }
}
window.addEventListener("resize", resize);
resize();

// Render loop
function render() {
  if (!program) return; // Don't render if shaders aren't loaded yet

  const currentTime = performance.now();
  const time = (currentTime - startTime) / 1000;

  // FPS calculation
  frameCount++;
  if (currentTime - lastTime >= 1000) {
    document.getElementById("fps").textContent = frameCount;
    frameCount = 0;
    lastTime = currentTime;
  }

  gl.useProgram(program);
  gl.uniform1f(timeLocation, time);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  gl.uniform2f(mouseLocation, mouseX, mouseY);
  gl.uniform1f(modeLocation, currentMode);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(render);
}

initializeShaders();

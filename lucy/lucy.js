const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

let program;
let timeLocation, resolutionLocation, mouseLocation;
let mouseX = 0.5,
  mouseY = 0.5;
let frameCount = 0;
let lastTime = performance.now();
let startTime = performance.now();

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
    // Load shader files
    const vertexShaderSource = await loadShader("shaders/vertex.glsl");
    const fragmentShaderSource = await loadShader("shaders/lucy.frag");

    // Compile shaders
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
  mouseY = canvas.height - (e.clientY - rect.top);
});

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resize);
resize();

function render() {
  if (!program) return; // Don't render if shaders aren't loaded yet

  const currentTime = performance.now();
  const time = (currentTime - startTime) / 1000;

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

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(render);
}

initializeShaders();

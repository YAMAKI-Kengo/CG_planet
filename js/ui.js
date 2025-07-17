export function setupPlanetSidebar(objects) {
  const container = document.getElementById("planet-controls-container");
  container.innerHTML = "";

  objects.forEach((obj) => {
    const data = obj.userData;
    if (!data || (data.type !== "planet" && data.type !== "comet")) return;

    const set = document.createElement("div");
    set.className = "planet-control-set";

    const title = document.createElement("h4");
    title.textContent = data.name;
    set.appendChild(title);

    let controls = [];
    if (data.type === "planet") {
      controls = [
        { label: "大きさ", prop: "sizeMultiplier" },
        { label: "自転速度", prop: "rotationSpeedMultiplier" },
        { label: "公転速度", prop: "orbitSpeedMultiplier" },
      ];
    } else if (data.type === "comet") {
      controls = [
        { label: "大きさ", prop: "sizeMultiplier" },
        { label: "公転速度", prop: "orbitSpeedMultiplier" },
      ];
    }

    controls.forEach((control) => {
      const group = document.createElement("div");
      group.className = "control-group-sidebar";

      const label = document.createElement("label");
      const valueSpan = document.createElement("span");
      valueSpan.textContent = data[control.prop].toFixed(1) + "x";
      label.textContent = `${control.label}: `;
      label.appendChild(valueSpan);

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = 0;
      slider.max = 3;
      slider.step = 0.1;
      slider.value = data[control.prop];

      slider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        data[control.prop] = value;
        valueSpan.textContent = value.toFixed(1) + "x";
      });

      group.appendChild(label);
      group.appendChild(slider);
      set.appendChild(group);
    });

    if (data.orbitPath) {
      const group = document.createElement("div");
      group.className = "control-group-sidebar";

      const label = document.createElement("label");
      label.textContent = "軌道の表示";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = data.orbitVisible;

      checkbox.addEventListener("change", (e) => {
        data.orbitVisible = e.target.checked;
      });

      group.appendChild(label);
      group.appendChild(checkbox);
      set.appendChild(group);
    }

    container.appendChild(set);
  });
}

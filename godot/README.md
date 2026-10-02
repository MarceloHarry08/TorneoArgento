# 🇦🇷 TORNEO ARGENTO 16-BIT: La Batalla Final (Versión Godot 4)

Videojuego de peleas arcade estilo retro de 16-bits (Mortal Kombat / Street Fighter) recreado y optimizado de forma nativa para **Godot Engine 4** (`C:\Users\marce\OneDrive\Documentos\juego-fight`).

---

## 🚀 Cómo Jugar desde Godot

Tienes varias formas sencillas de ejecutar el juego:

### Opción 1: Directamente desde el Editor de Godot
1. Abre **Godot Engine 4** en tu computadora.
2. Si aún no está en la lista de proyectos, haz clic en **Importar** y selecciona la carpeta:  
   `C:\Users\marce\OneDrive\Documentos\juego-fight\project.godot`
3. Presiona el botón **Play** (o la tecla `F5`) para ejecutar el juego.

### Opción 2: Con doble clic en Windows
- **Para jugar directamente:** Haz doble clic en `JUGAR_EN_GODOT.bat`.
- **Para abrir el editor de Godot:** Haz doble clic en `ABRIR_EDITOR_GODOT.bat`.

---

## 🕹️ Controles del Juego (Esquema Oficial Arcade)

El juego cuenta con un esquema de controles unificado y definitivo basado en las flechas del teclado y un bloque arcade superior de 6 botones:

### 🔴 Movimiento (Flechas tradicionales)
- **`move_left`**: Flecha Izquierda (`←`)
- **`move_right`**: Flecha Derecha (`→`)
- **`jump`**: Flecha Arriba (`↑`)
- **`crouch`**: Flecha Abajo (`↓`)

### 🔵 Bloque de Combate (6 Botones Arcade)
| Acción | Acción InputMap | Tecla Oficial | Función / Efecto |
| :--- | :--- | :--- | :--- |
| **Piña Alta** | `punch_high` | `INS` / `INSERT` | Gancho demoledor (Fuerte, alto) |
| **Piña Baja** | `punch_low` | `INICIO` / `HOME` | Jab rápido (Liviano, ágil) |
| **Patada Alta** | `kick_high` | `SUPR` / `DELETE` | Patada a la cabeza (Gran alcance) |
| **Patada Baja** | `kick_low` | `FIN` / `END` | Patada corta rápida |
| **Cubrirse / Guardia** | `block` | `RE PÁG` / `PAGE UP` | Bloqueo activo (Reduce 80% del daño) |
| **Correr** | `run` | `AV PÁG` / `PAGE DOWN` | Correr veloz al mantener dirección |
| **Pausa** | `pause` | `ESC` / `ESCAPE` | Menú de pausa y comandos |

### ⚡ Combos y Ataques Agachados
- **Ataques Agachados**: Mantén `crouch` (`↓`) y presiona cualquier piña o patada para ejecutar su variante baja/barrida.
- **`↓` + `→` + Piña**: Ataque Especial 1.
- **`↓` + `←` + Patada**: Ataque Especial 2.
- **Hit-Stop Micro-Pausa**: Pausa de impacto de 0.06s para máxima satisfacción táctil arcade.
- **¡FATALITY!**: Al noquear al rival al final de la pelea, presiona cualquier botón de ataque para liquidarlo.

---

## 👥 Roster Completo de 16 Luchadores

1. 🦁 **El León** *(Javier Milei)*: Mordisco Salvaje, Zarpazo Felino, Rugido de la Selva, León Astral Supremo.
2. 🏛️ **La Tina** *(Cristina Kirchner)*: Rayo de Sol de Mayo, Lluvia de Pirámides, Cadena Nacional Blast, Poder Piramidal Cósmico.
3. 🐱 **Ojos Azules** *(Mauricio Macri)*: Lanzamiento Gatuno, Estampida de Gatitos, Globo Amarillo Mine, Garra Felina Presidencial.
4. 👟 **Pepe Argento** *(Guillermo Francella)*: Furia Racing Club, Zapatazo Rabioso, Pistola de Píxeles, ¡Pedazo de Soooquete!
5. ❄️ **El Eternauta** *(Juan Salvo / Ricardo Darín)*: Nevada Mortal (Congelación Sub-Zero), Monolito de Hielo, Voxel Barrier, Esferas de Cero Absoluto.
6. 💵 **El Comandante** *(Ricardo Fort)*: Tormenta de Billetes de 100 USD, Lluvia de Oro, Rolls Royce Dash, Miami Explosion.
7. ⚽ **El Mesías** *(Lionel Messi)*: Tiro Libre Chanfle 10, Gambeta Cósmica, Balón de Oro Cannon, Chilena del Campeón del Mundo.
8. 🪶 **La One** *(Moria Casán)*: Uñas de Acero, Látigo de Cabellera, Lengua Karateka, Torbellino Diva de Uñas.
9. ☎️ **La Su** *(Susana Giménez)*: Tormenta de Sol Radiante, Teléfono de Oro, Llamado Millonario, Supernova Punta del Este.
10. 🚛 **Hugo** *(Marcelo Tinelli)*: Risa Sónica Ultrasónica, Movimiento Relámpago, Rexona Missile, ¡Chau Chau Chauuu! Blitz.
11. 🕶️ **Pérgolas** *(Mario Pergolini)*: Dron Espía de Ataque, Robot Centinela 16-Bit, CQC Mic Whip, Hackeo Satelital CQC.
12. ⚔️ **Sangre Japonesa** *(China Suárez)*: Beso Venenoso, Niebla Tóxica, Sablazo Granadero, Espinas del Amor Venenoso.
13. 👑 **La Faraona** *(Martín Cirio)*: Lanzamiento de Maíz Explosivo, Invocación de Gallinas Cluecas, Rayo Faraónico, Tornado de Gallinas.
14. 💅 **Bad Bitch** *(Wanda Nara)*: Bomba de Glitter, Mina Antipersona VIP, Cartera Louis Strike, Detonación Paparazzi.
15. 🎹 **Oído Absoluto** *(Charly García)*: Acorde de Piano Gigante, Riff de Guitarra Eléctrica, Synth Shockwave, Sinfonía Say No More.
16. 👑 **La Inmortal** *(Mirtha Legrand - JEFA FINAL)*: Levitación de Vajilla y Sillas, Rayos de la Inmortalidad, Mesaza Table Smash, Juicio Milenario de la Mesaza.

---

## 🏛️ Escenarios Argentinos Míticos
- 🏙️ **Obelisco de Buenos Aires**: Farolas con halo luminoso cálido, ciclo de semáforos, neones de Quilmes/Clarín y luces de autos en 9 de Julio.
- 🏛️ **Plaza de Mayo / Casa Rosada**: Bandera argentina ondeando al viento, Sol de Mayo refulgente y farolas coloniales doradas.
- 🎨 **Caminito (La Boca)**: Ropa secándose en los balcones, faroles titilantes de adoquín y ojos de gatos callejeros.
- ❄️ **Glaciar Perito Moreno**: Partículas continuas de nieve cayendo y neblina gélida sobre el agua turquesa.
- 🍽️ **Templo Inmortal de la Mesaza**: Candelabros de cristal resplandecientes, velas titilando y destellos dorados en el piso de mármol.

---

## ⚙️ Estructura del Proyecto en Godot 4
- `project.godot`: Configuración nativa a resolución arcade 640x360 con escalado pixel-perfect y filtro de texturas *Nearest*.
- `scripts/game_data.gd`: Singleton Autoload con definiciones de luchadores, poderes, combos, estadísticas y mapeo de controles dinámico.
- `scripts/sound_engine.gd`: Motor de audio chiptune con síntesis en tiempo real de efectos de sonido y pistas de Rock Nacional (Soda Stereo, Rata Blanca, Charly García, Viejas Locas, Attaque 77).
- `scripts/fighter.gd`: Controlador de física 2D, máquina de estados, corte dinámico de sprites, combos, poderes especiales, congelamiento y sistema de Inteligencia Artificial (Fácil, Normal, Difícil, Extremo).
- `scripts/projectile.gd`: Renderizado procedural y detección de impacto de proyectiles temáticos (gatos, billetes, rayos solares, témpanos de hielo, balones de oro, pianos).
- `scripts/battle.gd`: Árbitro de combate, sistema al mejor de 3 rondas, reloj de 99s, barras de vida/energía, K.O., pantalla de ¡LIQUIDÁLO! y Fatalities.
- `scenes/`:
  - `title_screen.tscn`: Menú principal con fondo arcade y selección de modos.
  - `character_select.tscn`: Selector de luchadores con cuadrícula 4x4, retratos en miniatura, atributos y vista previa.
  - `tower_screen.tscn`: Escalafón de la Torre Arcade estilo Mortal Kombat.
  - `battle.tscn`: Escenario de combate completo con HUD interactivo y menú de pausa.
  - `victory_screen.tscn`: Pantalla de victoria con pose final, frase célebre y condecoración de Fatality.

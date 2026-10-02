shader_type canvas_item;

// TORNEO ARGENTO 16-BIT - CRT RETRO ARCADE SCANLINE SHADER

uniform sampler2D screen_texture : hint_screen_texture, filter_nearest;
uniform float scanline_count : hint_range(50.0, 400.0) = 180.0;
uniform float scanline_intensity : hint_range(0.0, 1.0) = 0.14;
uniform float vignette_intensity : hint_range(0.0, 1.0) = 0.20;

void fragment() {
	vec2 uv = SCREEN_UV;
	vec4 col = texture(screen_texture, uv);
	
	// Subtle Scanlines
	float scanline = sin(uv.y * scanline_count * 3.14159265);
	scanline = (scanline + 1.0) * 0.5;
	col.rgb -= scanline * scanline_intensity;
	
	// Smooth Arcade Screen Vignette
	vec2 uv_norm = uv * (1.0 - uv.yx);
	float vig = uv_norm.x * uv_norm.y * 15.0;
	vig = clamp(pow(vig, vignette_intensity), 0.0, 1.0);
	col.rgb *= vig;
	
	COLOR = col;
}

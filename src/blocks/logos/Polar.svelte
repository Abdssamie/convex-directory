<script lang="ts">
	let { class: className, ...rest } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 40 40"
	class={className}
	width="40"
	height="40"
	aria-label="Polar"
	style="flex: none; line-height: 1;"
	{...rest}
>
	<!-- Polar logo: blue circle with a stylised P -->
	<circle cx="20" cy="20" r="20" fill="#1a1a2e" />
	<circle cx="20" cy="20" r="18" fill="#0f3460" />
	<text
		x="20"
		y="26"
		text-anchor="middle"
		font-family="system-ui, sans-serif"
		font-weight="700"
		font-size="18"
		fill="#e94560"
	>P</text>
</svg>

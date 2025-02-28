<script>
	import { t } from 'svelte-i18n';
	import { diagonalSlide, fade, fly } from '$lib/helpers/transition';
	import { bezier } from '$lib/helpers/easing';
	import { data } from '$lib/data/characters.json';
	import { assetPath } from '$lib/helpers/assets';
	import positionToStyle from '$lib/helpers/css-transformer';

	export let item = {};

	let rateup, bannerName, combat_type;
	$: ({ rateup, bannerName, combat_type, featured } = item);
	$: bannerTitle = $t(`banner.${bannerName}`);

	const characterOffset = (characterName, offset = 'bannerOffset') => {
		const item = data.find(({ name }) => name === characterName) || {};
		return positionToStyle(item[offset]);
	};
</script>

<div class="content">
	<div class="banner-name">{$t('banner.character-event')}</div>

	<!-- Left Pane -->
	<div class="wrapper-info">
		<div class="info-body" in:fade={{ duration: 500, delay: 250 }}>
			<div class="short-detail">
				<h1>{bannerTitle}</h1>
				<div class="time">
					<i class="hsr-time" />
					<caption>{$t('warp.duration')}</caption>
				</div>
				<div class="description">
					<p>{@html $t('warp.warpDescription')}</p>
					<p>{$t('warp.itemRateBoost', { values: { itemtype: $t('character') } })}</p>
				</div>
			</div>

			<div class="rateup-characters">
				<div class="rateup-row" in:diagonalSlide={{ delay: 300, duration: 350 }}>
					{#each rateup as name, i}
						<div class="rateup-item">
							<div class="rateup-content">
								<picture
									in:fly={{
										x: -20,
										duration: 2000,
										easing: bezier(0.13, 0.14, 0, 1),
										delay: 300 + 150 * i
									}}
								>
									<source
										srcset={assetPath(`splash-art/4/${name}`, 1280)}
										media="(min-width: 840px)"
									/>
									<img
										src={assetPath(`splash-art/4/${name}`, 640)}
										alt={$t(name)}
										style={characterOffset(name)}
										crossorigin="anonymous"
									/>
								</picture>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Right Pane -->
	<div class="character">
		<div class="char-group" style={characterOffset(featured, 'textOffset')}>
			<div class="name">
				<i class="hsr-{combat_type} icon-gradient {combat_type}" />
				<span>{$t(featured)}</span>
			</div>
			<div class="stars">
				{#each Array(5) as _} <i class="hsr-star" />{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.content {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
	}

	.banner-name {
		position: absolute;
		top: 2%;
		left: -1.1%;
		font-size: calc(0.015 * var(--bw));
		padding: 0.45% 1.5% 0.5%;
		border-top-right-radius: 2rem;
		border-bottom-right-radius: 2rem;
		background-color: var(--bn-color2);
		z-index: +1;
	}

	.wrapper-info {
		width: 30%;
		height: 100%;
		color: #333;
		padding: 1.3%;
		position: relative;
	}

	.info-body {
		height: 100%;
		border-left: 1px solid #aaa;
		padding: 5%;
		display: flex;
		flex-direction: column;
	}

	:global(.mobileLandscape) .info-body {
		padding: 5% 5% 5% 7%;
	}

	.description,
	.time {
		display: flex;
		align-items: center;
	}

	.time i {
		line-height: 0;
		margin-right: 2%;
		font-size: calc(0.024 * var(--bw));
	}

	.time {
		font-size: calc(0.018 * var(--bw));
		margin-bottom: 2%;
	}

	.description {
		padding: 6% 0 0 1%;
		align-items: flex-start;
		flex-direction: column;
		height: calc(0.09 * var(--bw));
		overflow: auto;
		mask-image: linear-gradient(black 80%, transparent);
	}

	.description::-webkit-scrollbar {
		display: none;
	}

	.description p,
	.time {
		line-height: 130%;
	}

	.description p {
		font-size: calc(0.017 * var(--bw));
		margin-bottom: 5%;
	}

	:global(.mobileLandscape) .description p {
		font-size: calc(0.016 * var(--bw));
	}

	.description :global(span),
	.time {
		color: #e6993d;
	}

	h1 {
		margin-top: 5%;
		font-size: calc(0.0335 * var(--bw));
		height: calc(0.16 * var(--bw));
		display: flex;
		align-items: center;
	}

	:global(.ja-JP) h1 {
		font-size: calc(0.04 * var(--bw));
	}

	:global(.mobileLandscape) h1 {
		margin-top: 13%;
		font-size: calc(0.022 * var(--bw));
		height: calc(0.07 * var(--bw));
		line-height: 100%;
	}

	/* Rateup */
	.rateup-characters {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.rateup-row {
		display: flex;
		width: 100%;
		height: calc(0.202 * var(--bw));
		justify-content: center;
		padding: 1.725%;
	}

	.rateup-item {
		width: 33.33333333%;
		height: 100%;
		padding: 0 2.5%;
	}
	.rateup-content {
		width: 100%;
		height: 100%;
		border-radius: 10rem;
		overflow: hidden;
		background-color: rgba(255, 255, 255, 0.9);
	}

	picture {
		position: relative;
		height: 100%;
		display: block;
	}

	picture img {
		position: absolute;
		height: 200%;
	}
	:global(.mobileLandscape) picture img {
		transform: translateX(-1.3%);
	}

	/* character name */
	.character {
		width: 70%;
		height: 100%;
		position: relative;
	}
	.char-group {
		position: absolute;
		z-index: +3;
		top: 62%;
		left: 12%;
	}
	.name {
		background-color: rgba(0, 0, 0, 0.65);
		height: calc(0.0235 * var(--bw));
		display: flex;
		align-items: center;
	}
	.name i {
		padding: 0 calc(0.01 * var(--bw));
		font-size: calc(0.025 * var(--bw));
	}
	.name span {
		display: block;
		padding-right: calc(0.01 * var(--bw));
		font-size: calc(0.016 * var(--bw));
	}

	.stars {
		padding: 0 10%;
		text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
		height: calc(0.02 * var(--bw));
		width: fit-content;
		display: flex;
		align-items: center;
		font-size: calc(0.014 * var(--bw));
		margin-top: 4%;
		line-height: 0;
		background-color: rgba(0, 0, 0, 0.65);
	}
</style>

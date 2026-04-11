<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import Check from '@lucide/svelte/icons/check';
	import { T, getTranslate } from '@tolgee/svelte';

	const { t } = getTranslate();

	// Helper function to get non-empty feature keys for a tier.
	// Hard-coded indices are intentional: a dynamic loop (incrementing until empty)
	// doesn't work because Tolgee wraps ALL output with invisible zero-width Unicode
	// markers in dev/preview mode, making empty-check and key-name comparison fail.
	// We use a fixed upper bound and strip the markers explicitly.
	function getFeatureKeys(tierPath: string): string[] {
		const keys = ['0', '1', '2', '3', '4', '5'];
		return keys.filter((key) => {
			const fullKey = `${tierPath}.${key}`;
			const value = $t(fullKey, { orEmpty: true });
			// Strip zero-width Unicode chars Tolgee adds for in-context editing
			const clean = value?.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').trim();
			return clean && clean.length > 0 && clean !== fullKey;
		});
	}

	// Get non-empty feature keys for each tier (reactively updates on language change)
	const freeFeatureKeys = $derived(getFeatureKeys('pricing.features.free'));
	const proFeatureKeys = $derived(getFeatureKeys('pricing.features.pro'));
	const enterpriseFeatureKeys = $derived(getFeatureKeys('pricing.features.enterprise'));
</script>

<section class="py-16 md:py-24">
	<div class="mx-auto max-w-6xl px-6 lg:px-12">
		<div class="mt-12 gap-4 sm:grid sm:grid-cols-2 md:mt-24">
			<div class="sm:w-3/5">
				<h1 class="text-3xl font-bold sm:text-4xl">
					<T keyName="pricing.title" />
				</h1>
			</div>
			<div class="mt-6 sm:mt-0">
				<p>
					<T keyName="pricing.description" />
				</p>
			</div>
		</div>

		<div class="mt-12 grid gap-6 md:mt-24 md:grid-cols-2 lg:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle class="font-medium">
						<T keyName="pricing.tiers.free.name" />
						<span class="ml-2 text-xs font-normal text-muted-foreground">
							<T keyName="pricing.current_plan_badge" />
						</span>
					</CardTitle>

					<span class="my-3 block text-2xl font-semibold">
						<T keyName="pricing.tiers.free.price" />
					</span>

					<CardDescription class="text-sm">
						<T keyName="pricing.tiers.free.description" />
					</CardDescription>
					<Button variant="outline" class="mt-4 w-full" disabled>
						<T keyName="pricing.tiers.free.button" />
					</Button>
				</CardHeader>

				<CardContent class="space-y-4 pb-6">
					<hr class="border-dashed" />

					<ul class="list-outside space-y-3 text-sm">
						{#each freeFeatureKeys as key (key)}
							<li class="flex items-center gap-2">
								<Check class="size-3" />
								<T keyName="pricing.features.free.{key}" />
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>

			<Card class="relative overflow-visible">
				<span
					class="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full bg-linear-to-br/increasing from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-white/20 ring-offset-1 ring-offset-gray-950/5 ring-inset"
				>
					<T keyName="pricing.popular_badge" />
				</span>

				<CardHeader>
					<CardTitle class="font-medium">
						<T keyName="pricing.tiers.pro.name" />
					</CardTitle>

					<span class="my-3 block text-2xl font-semibold">
						<T keyName="pricing.tiers.pro.price" />
					</span>

					<CardDescription class="text-sm">
						<T keyName="pricing.tiers.pro.description" />
					</CardDescription>

					<!-- TODO: Enable when Polar billing is configured -->
					<Button class="mt-4 w-full" disabled>
						Coming soon
					</Button>
				</CardHeader>

				<CardContent class="space-y-4 pb-6">
					<hr class="border-dashed" />

					<ul class="list-outside space-y-3 text-sm">
						{#each proFeatureKeys as key (key)}
							<li class="flex items-center gap-2">
								<Check class="size-3" />
								<T keyName="pricing.features.pro.{key}" />
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="font-medium">
						<T keyName="pricing.tiers.enterprise.name" />
					</CardTitle>

					<span class="my-3 block text-2xl font-semibold">
						<T keyName="pricing.tiers.enterprise.price" />
					</span>

					<CardDescription class="text-sm">
						<T keyName="pricing.tiers.enterprise.description" />
					</CardDescription>

					<Button variant="outline" class="mt-4 w-full" href="mailto:sales@example.com">
						<T keyName="pricing.tiers.enterprise.button" />
					</Button>
				</CardHeader>

				<CardContent class="space-y-4 pb-6">
					<hr class="border-dashed" />

					<ul class="list-outside space-y-3 text-sm">
						{#each enterpriseFeatureKeys as key (key)}
							<li class="flex items-center gap-2">
								<Check class="size-3" />
								<T keyName="pricing.features.enterprise.{key}" />
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

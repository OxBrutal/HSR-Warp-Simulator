import { regReward, starterRemaining } from '$lib/stores/app-store';
import { HistoryManager } from '$lib/stores/idbManager';
import { guaranteedStatus, localPity, owneditem, rollCounter } from '$lib/stores/localstorage';
import { rates, prob } from './probabilities';

const { addHistory } = HistoryManager;

export const roll = async (banner, WarpInstance) => {
	const pity5 = localPity.get(`pity5${banner}`) + 1;
	const pity4 = localPity.get(`pity4${banner}`) + 1;

	const isLC = banner === 'lightcone-event';
	const maxPity = isLC ? 80 : 90;

	const rate5star = () => {
		return rates({
			baseRate: isLC ? 0.8 : 0.6,
			rateIncreasedAt: isLC ? 63 : 74,
			currentPity: pity5,
			maxPity
		});
	};

	const rate4star = () => {
		return rates({
			baseRate: isLC ? 6.6 : 5.1,
			currentPity: pity4,
			maxPity: 10,
			rateIncreasedAt: 9
		});
	};

	let chance5star = rate5star();
	let chance4star = rate4star();
	let chance3star = 100 - chance4star - chance5star;

	if (chance3star < 0 && pity5 >= maxPity) chance4star = 0;
	if (chance3star < 0) chance3star = 0;
	if (chance4star === 100) chance5star = 0;

	const item = [
		{
			rarity: 3,
			chance: chance3star
		},
		{
			rarity: 4,
			chance: chance4star
		},
		{
			rarity: 5,
			chance: chance5star
		}
	];

	let { rarity } = prob(item);
	let pity = 1;

	const rollQty = rollCounter.get(banner);
	rollCounter.set(banner, rollQty + 1);

	if (banner === 'starter') {
		// starter banner limited 50 pulls
		const isAlreadyGet5star = guaranteedStatus.get('starter');
		const isGuaranteed50pull = rollQty === 49 && !isAlreadyGet5star;
		if (isGuaranteed50pull) rarity = 5;
		starterRemaining.update((v) => v - 1);
	}

	// 300th pulls on regular banner, pick a character
	if (rollQty <= 300 && banner === 'regular') {
		regReward.update(({ isClaimed }) => ({ rollcount: rollQty + 1, isClaimed }));
	}

	if (rarity === 5) {
		localPity.set(`pity4${banner}`, pity4);
		localPity.set(`pity5${banner}`, 0);
		pity = pity5;
	}

	if (rarity === 4) {
		localPity.set(`pity4${banner}`, 0);
		localPity.set(`pity5${banner}`, pity5);
		pity = pity4;
	}

	if (rarity === 3) {
		localPity.set(`pity4${banner}`, pity4);
		localPity.set(`pity5${banner}`, pity5);
	}

	// Get Item
	const randomItem = WarpInstance.getItem(rarity, banner);
	const { manual, warp } = owneditem.put({ name: randomItem.name });
	const numberOfOwnedItem = manual + warp - 1;

	// storing item to storage
	await saveResult({ pity, ...randomItem });

	const isFullEidolon = numberOfOwnedItem > 6;
	const isNew = numberOfOwnedItem < 1;

	// Undying Counter
	const undyingType = randomItem.rarity === 3 ? 'embers' : 'starlight';
	const undyingQty = getMilestoneQty(randomItem.rarity, randomItem.type, isFullEidolon, isNew);

	// Set Eidolon
	if (randomItem.type === 'character' && !isNew) {
		randomItem.eidolon = !isFullEidolon;
	}

	const result = { pity, isNew, undyingQty, undyingType, ...randomItem };
	return result;
};

const getMilestoneQty = (rarity, type, isFullEidolon, isNew) => {
	// Always give bonus on obtaining lightcone
	if (type === 'lightcone') {
		if (rarity === 3) return 20; // *3
		if (rarity === 4) return 8; // *4
		return 40; // *5
	}

	// Don't give bonus to newly obtained character
	if (isNew) return 0;

	// Give starlight for duplicate characters
	if (rarity === 4) return isFullEidolon ? 20 : 8; // *4
	return isFullEidolon ? 100 : 40; // *5
};

const saveResult = async (result) => {
	// await addHistory()

	const data = { ...result };
	delete data.buttonOffset;
	delete data.splashartOffset;
	delete data.gachaCardOffset;
	delete data.bannerOffset;

	await addHistory(data);
};

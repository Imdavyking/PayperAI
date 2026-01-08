// sources/meme_coin_factory.move
module meme_coin_factory::message {
    use std::string;
    use std::signer;
    use std::option;
    use aptos_framework::fungible_asset::{Self, Metadata, MintRef, TransferRef, BurnRef};
    use aptos_framework::object;
    use aptos_framework::primary_fungible_store;

    /// Struct to store coin metadata and capabilities
    struct ManagedFungibleAsset has key {
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef,
    }

    /// Create a new meme coin
    public entry fun create_meme_coin(
        creator: &signer,
        name: vector<u8>,
        symbol: vector<u8>,
        initial_supply: u64,
    ) {
        // // Create a named object for the coin
        // let constructor_ref = &object::create_named_object(
        //     creator,
        //     name,
        // );

        // // Initialize fungible asset
        // primary_fungible_store::create_primary_store_enabled_fungible_asset(
        //     constructor_ref,
        //     option::none(),
        //     string::utf8(name),
        //     string::utf8(symbol),
        //     8,
        //     string::utf8(b""),
        //     string::utf8(b""),
        // );

        // // Generate refs for managing the asset
        // let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        // let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        // let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);
        // let metadata_object_signer = object::generate_signer(constructor_ref);

        // move_to(
        //     &metadata_object_signer,
        //     ManagedFungibleAsset { mint_ref, transfer_ref, burn_ref }
        // );

        // // Mint initial supply to creator BEFORE storing the refs
        // if (initial_supply > 0) {
        //     let creator_store = primary_fungible_store::ensure_primary_store_exists(
        //         signer::address_of(creator),
        //         object::object_from_constructor_ref<Metadata>(constructor_ref),
        //     );
        //     let fa = fungible_asset::mint(&mint_ref, initial_supply);
        //     fungible_asset::deposit_with_ref(&transfer_ref, creator_store, fa);
        // };

        // // Store the refs AFTER using them
        // let metadata_object_signer = object::generate_signer(constructor_ref);
        // move_to(
        //     &metadata_object_signer,
        //     ManagedFungibleAsset { mint_ref, transfer_ref, burn_ref }
        // );
    }
}
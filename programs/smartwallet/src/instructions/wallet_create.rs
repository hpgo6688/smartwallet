#![allow(deprecated)]
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use solana_program::native_token::LAMPORTS_PER_SOL;

use crate::errors::MultisigError;
use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WalletCreateArgs {
    pub owner: Pubkey,
    /// Memo is used for indexing only.
    pub memo: Option<String>,
}

#[derive(Accounts)]
#[instruction(args: WalletCreateArgs)]
pub struct WalletCreate<'info> {
    #[account(
        init,
        payer = creator,
        space = Wallet::size(),
        seeds = [SEED_PREFIX, SEED_MULTISIG, owner.key().as_ref()],
        bump
    )]
    pub wallet: Account<'info, Wallet>,

    /// An ephemeral signer that is used as a seed for the Multisig PDA.
    /// Must be a signer to prevent front-running attack by someone else but the original creator.
    pub owner: Signer<'info>,

    /// The creator of the multisig.
    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

impl WalletCreate<'_> {
    fn validate(&self) -> Result<()> {
        Ok(())
    }

    /// Creates a multisig.
    #[access_control(ctx.accounts.validate())]
    pub fn multisig_create(ctx: Context<Self>, args: WalletCreateArgs) -> Result<()> {
        // Initialize the multisig.
        let multisig = &mut ctx.accounts.wallet;
        multisig.transaction_index = 0;
        multisig.create_key = ctx.accounts.owner.key();
        multisig.bump = ctx.bumps.wallet;

        Ok(())
    }
}

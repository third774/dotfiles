export ZSH=~/.oh-my-zsh

bindkey -v

HISTSIZE=100000
SAVEHIST=100000
setopt HIST_IGNORE_ALL_DUPS HIST_SAVE_NO_DUPS SHARE_HISTORY EXTENDED_HISTORY

plugins=()

source $ZSH/oh-my-zsh.sh
source /opt/homebrew/opt/zsh-syntax-highlighting/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
ZSH_AUTOSUGGEST_STRATEGY=match_prev_cmd
source /opt/homebrew/opt/zsh-autosuggestions/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /opt/homebrew/opt/zsh-history-substring-search/share/zsh-history-substring-search/zsh-history-substring-search.zsh

eval "$(zoxide init zsh)"
source /opt/homebrew/opt/fzf/shell/completion.zsh
source /opt/homebrew/opt/fzf/shell/key-bindings.zsh

export EDITOR=nvim


export ZSH=~/.oh-my-zsh

plugins=(
  aws
  kubectl
  git
  docker
  node
  npm
)

source $ZSH/oh-my-zsh.sh
source /usr/local/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
ZSH_AUTOSUGGEST_STRATEGY=match_prev_cmd
source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/local/share/zsh-history-substring-search/zsh-history-substring-search.zsh
export ZSH=~/.oh-my-zsh

ZSH_THEME="agnoster"

plugins=(
  aws
  kubectl
  git
  docker
  node
  npm
)

source $ZSH/oh-my-zsh.sh
source /usr/local/opt/powerlevel9k/powerlevel9k.zsh-theme
source /usr/local/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh


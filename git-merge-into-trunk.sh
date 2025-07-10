#!/bin/bash
CURRENT=$(git branch --show-current)
git fetch origin trunk
git checkout trunk
git merge --no-ff "$CURRENT"
git push origin trunk
git checkout "$CURRENT"
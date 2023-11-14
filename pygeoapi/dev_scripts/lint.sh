#!/bin/bash

flake8 --config .flake8 processes
black .
black --check processes

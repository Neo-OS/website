+++
title = "Why Another Package Manager"
description = "The beggining of the Neo package manager"
tags = [
    "rust",
    "package-manager",
    "development",
]
date = "2019-10-20T09:12:53+01:00"
archives = "2019"
categories = [
    "Development",
    "Rust",
    "Neo"
]
+++

# What is a Package Manager
A package manager or package-management system is a collection of software tools that automates the process of installing, upgrading, configuring, and removing computer programs for a computer's operating system in a consistent manner.[^1] Many modern package managers can also send compressed packages(reduces download time and bandwidth), give packages checksums and sign them(improves security), and use third-party repositories(more programs).

# What is Rust
[**Rust**](https://www.rust-lang.org/) is a systems programming language that runs blazingly fast, prevents segfaults, and guarantees thread safety.[^2] Rust provides memory safety without a garbage collector, has an awesome build system called [cargo](https://doc.rust-lang.org/cargo/), and makes writing platform agnostic way super easy. A member of MSRC(Microsoft Security Response Center) mention in a presentation that "70 percent of the vulnerabilities Microsoft assigns a CVE each year continue to be memory safety issues."[^3] Using rust means less time doing bug fixes and more time making the package manager and new features.

# What are the Goals of Neo
Neo is still very very **VERY** early in development so not all of these goals have begun to be implemented(or started) but here is a list of features I plan implementing for Neo.

* Packages are downloaded, installed, and removed in parrallel
* Only update files that change (via hash checking)
* Use zstd compression (faster downloads)
* Serve and download over [**Rustls**](https://github.com/ctz/rustls)
* When installing program don't block user request to install another program (add it to queue)
* Third party repository system similiar to [AUR](https://aur.archlinux.org/)
* Source code build system similiar to gentoo's
* Be platform agnostic(A different repo for every kernel)
* Resume partial package install/updates
* Check package integrity: missing files, hashes, missing or unresolved (reverse)dependencies, dangling or modified symlinks, etc

# But I Don't Want to Learn a New Syntax
To make it easier for user's to switch to Neo OS from another unix operating system Neo will adopt multiple arguemnts for the same function.

Install package     | Remove package        | Update All  
------------------- | --------------------- | ---------- 
neo -S package      | neo -Rs package       | neo -Syu package
neo add package     | neo del package       | neo update package
neo install package | neo uninstall package | neo upgrade package
neo get package     | neo rm package        | neo up package

[^1]: ["Archived Copy"](https://web.archive.org/web/20171017151526/http://aptitude.alioth.debian.org/doc/en/pr01s02.html) Archived from the [original](https://aptitude.alioth.debian.org/doc/en/pr01s02.html) on 17 October 2017. Retrieved 20 October 2019.
[^2]: ["Archived Copy"](https://web.archive.org/web/20181014202530/https://www.rust-lang.org/en-US/)Archived from the [original](https://www.rust-lang.org/en-US/) on 14 October 2018. Retrieved 20 October 2019.
[^3]: MSRC (2019-02-07). ["2019_01 - BlueHatIL - Trends, challenge, and shifts in software vulnerability mitigation"](https://github.com/Microsoft/MSRC-Security-Research/blob/master/presentations/2019_02_BlueHatIL/2019_01%20-%20BlueHatIL%20-%20Trends%2C%20challenge%2C%20and%20shifts%20in%20software%20vulnerability%20mitigation.pdf). 

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

    config.vm.box = "ubuntu/trusty64"

    config.vm.synced_folder ".", "/var/www", type: "nfs"
    config.vm.hostname = "skinpreview3d" 
	config.vm.network "forwarded_port", guest: 80, host: 80
	
    config.vm.provider "virtualbox" do |v|
        v.memory = 2048
        v.cpus = 2
        v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
        v.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
	end

    # Shell provisioning
	config.vm.provision "shell" do |s|
        s.path = "config/init.sh"
    end

end
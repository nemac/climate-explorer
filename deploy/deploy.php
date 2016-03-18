<?php
/**
 * NTKNetworks CodeDeploy
 * GitHub and Bitbucket server code deployment
 * Learn more: http://www.ntknetworks.com/support
 * Author: www.ntknetworks.com
 * @version 1.0
 */

class codeDeploy{

    private $source = 1; // 0 for Bitbucket, 1 for GitHub
    private $user = 'habitatseven';	// Site username
    private $pass = 'c0raplok';	// Site password
    private $repo = 'Climate_Explorer';	// repository name
    private $deploy = '/home/habitatsevendev/public_html/climateexplorer/';	// directory to deploy repository, we've included a tool to know what is the exact
    private $download_name = 'commit.zip'; // name of downloaded zip file, you can leave it like this
    private $debug = true;	// false = hide output. If true, will generate a log with all the activities.
    private $process = 'update'; // deploy or update - Deploy will insert all the files in the commit, even if they weren't changed, update will only apply the changes.

// files to ignore in directory
private $ignore_files = array('README.md', '.gitignore', 'config.php', 'wp-config.php', 'deploy.php');
	
/////////////////////////// STOP EDITING BELOW THIS LINE //////////////////////////////	
 
	// default array of files to be committed
	private $files = array('modified' => array(), 'added' => array(), 'removed' => array());
 
	function __construct(){
 
		$json = isset($_POST['payload']) ? $_POST['payload'] : false;
		if ($json){
			$data = json_decode($json);	// decode json into php object
									
			// process all commits
			if (count($data->commits) > 0){
				foreach($data->commits as $commit){
					
					if ($this->source == 0):				
						$node = $commit->node;	// default value
					elseif ($this->source == 1):
						$node = $commit->id;	// capture repo node
					endif;
						$message = $commit->message;	// capture repo message

					if($this->source == 0):				
					
						$files = $commit->files;	// capture repo file changes

						// reset files list
						$this->files = array(
							'modified' => array(), 
							'added' => array(), 
							'removed' => array());
						
						foreach($files as $file){
							$this->files[$file->type][] = $file->file;
						}

					elseif($this->source == 1):
					
						$this->files = array(
							'removed' => array(),
							'added' => array(),
							'modified' => array());
							
						$this->files['removed'] = $commit->removed;
						$this->files['added'] = $commit->added;
						$this->files['modified'] = $commit->modified;

					endif;					
					
 
					// download repo
					if (!$this->get_repo($node)){
						$this->log('Download of Repo Failed');
						return;
					}
 
					// unzip repo download
					if (!$this->unzip_repo()){
						$this->log('Unzip Failed');
						return;
					}
 
					// append changes to destination
					$this->parse_changes($node, $message);
 
					// delete zip file
					unlink($this->download_name);
				}
			} else {
				// if no commits have been posted, deploy latest node
				$this->process = 'deploy';
 
				// download repo
				if (!$this->get_repo('master')){
					$this->log('Download of Repo Failed');
					return;
				}
 
				// unzip repo download
				if (!$this->unzip_repo()){
					$this->log('Unzip Failed');
					return;
				}
 
				$node = $this->get_node_from_dir();
				$message = 'Post failed, complete deploy';
				if (!$node){
					$this->log('Node could not be set, no unziped repo');
					return;	
				}
 
				// append changes to destination
				$this->parse_changes($node, $message);
 
				// delete zip file
				unlink($this->download_name);
			}
		} else {
			// no $_POST['payload']
			$this->log('No Payload');
		}
	}
 
	/**
	 * Extract the downloaded repo
	 * @return boolean
	 */
	function unzip_repo(){
		// init zip archive helper
		$zip = new ZipArchive;
 
		$res = $zip->open($this->download_name);
		if ($res === TRUE) {
			// extract files to base directory
		    $zip->extractTo('./');
		    $zip->close();
		    return true;
		}
		return false;
	}
 
	/**
	 * Download the repository from bitbucket
	 * @param  string $node 
	 * @return boolean
	 */
	function get_repo($node = ''){
 
		// create the zip folder
		$fp = fopen($this->download_name, 'w');
 
		// set download url of repository for the relating node
		if ($this->source == 0):				
			$ch = curl_init("https://bitbucket.org/$this->user/$this->repo/get/$node.zip");
		elseif ($this->source == 1):
			$ch = curl_init("https://github.com/$this->user/$this->repo/archive/$node.zip");
		endif;

 
		// http authentication to access the download
		curl_setopt($ch, CURLOPT_USERPWD, "$this->user:$this->pass");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
 
		// disable ssl verification if your server doesn't have it
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
 
		// save the transfered zip folder
		curl_setopt($ch, CURLOPT_FILE, $fp);
 
		// run the curl command
		$result = curl_exec($ch);	//returns true / false
 
		// close curl and file functions
		curl_close($ch);
		fclose($fp);
		return $result;
	}
 
	/**
	 * Apply the repository changes add, edit, delete
	 * @param  string $node    
	 * @param  string $message 
	 * @return void
	 */
	 
	function parse_changes($node = '', $message = ''){
		// need to go get the files to different locations
		if($this->source == 0):				
			$src = "./$this->user-$this->repo-$node/";
		elseif($this->source == 1):
			$src = "./$this->repo-$node/";
		endif;

 		if (!is_dir($this->deploy))
			$this->process = 'deploy';
 
		$this->log('Process: '.$this->process);
		$this->log('Commit Message: '.$message);
 
		$dest = $this->deploy;
		$real_src = realpath($src);
 
		if (!is_dir($real_src)){
			$this->log('Unable to read directory');			
			$this->log( $real_src );			
			return;
		}
 
		$output = array();
 
		$objects = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($real_src), 
			RecursiveIteratorIterator::SELF_FIRST);
 
		foreach ($objects as $name => $object){
 
			// check to see if file is in ignore list
			if (in_array($object->getBasename(), $this->ignore_files))
				continue;
 
			// remove the first '/' if there is one
			$tmp_name = str_replace($real_src, '', $name);
			if($tmp_name[0] == '/')
				$tmp_name = substr($tmp_name,1);
 
			switch ($this->process){
				case 'update':
					// only update changed files
					if(in_array($tmp_name, $this->files['added'])){
						$this->add_file($src . $tmp_name, $dest . $tmp_name);
					}
					if(in_array($tmp_name, $this->files['modified'])){
						$this->modify_file($src . $tmp_name, $dest . $tmp_name);
					}
				break;
				case 'deploy':
					$this->add_file($src . $tmp_name, $dest . $tmp_name);
				break;
			}
		}
 
		// delete all files marked for deleting
		if (!empty($this->files['removed'])){
			foreach($this->files['removed'] as $f){
				$this->removed($dest . $f);
			}
		}
 
		$this->delete($src);

		
	}
 
	/**
	 * Delete folder recursively
	 * @param  string $path 
	 * @return void
	 */
	private function delete($path) {
	    $objects = new RecursiveIteratorIterator(
	    	new RecursiveDirectoryIterator($path), 
	    	RecursiveIteratorIterator::CHILD_FIRST);
 
	    foreach ($objects as $object) {
	        if (in_array($object->getBasename(), array('.', '..'))) {
	            continue;
	        } elseif ($object->isDir()) {
	            rmdir($object->getPathname());
	        } elseif ($object->isFile() || $object->isLink()) {
	            unlink($object->getPathname());
	        }
	    }
	    rmdir($path);
	}
 
	/**
	 * Retrieve node from extracted folder name
	 * @return string
	 */
	private function get_node_from_dir(){
		$files = scandir('./');
		foreach($files as $f){
			if(is_dir($f)){
				// check to see if it starts with 
				$starts_with = "$this->user-$this->repo-";
				if(strpos($f, $starts_with) !== false){
					return substr($f, strlen($starts_with));
				}  
			}
		}
		return false;
	}
 
	/**
	 * Write log file
	 * @param  string $message 
	 * @return void
	 */
	private function log($message = ''){
		if (!$this->debug)
			return false;
 
		$message = date('d-m-Y H:i:s') . ' : ' . $message . "\n";
		file_put_contents('./log.txt', $message, FILE_APPEND);
	}
 
	/**
	 * Add new file
	 * @param string $src  
	 * @param string $dest 
	 * @return  void
	 */
	private function add_file($src, $dest){
		$this->log('add_file src: '. $src . ' => '.$dest);
		if (!is_dir(dirname($dest)))
			@mkdir(dirname($dest), 0755, true);
		@copy($src, $dest);
	}
 
	/**
	 * Replace file with new copy
	 * @param  string $src  
	 * @param  string $dest 
	 * @return void
	 */
	private function modify_file($src, $dest){
		$this->log('modify_file src: '. $src . ' => '.$dest);
		@copy($src, $dest);
	}
 
	/**
	 * Delete file from directory
	 * @param  string $file
	 * @return void
	 */
	private function removed($file){
		$this->log('remove_file file: '. $file);
 
		if (is_file($file))
			@unlink($file);
	}
 
}
new codeDeploy();

?>
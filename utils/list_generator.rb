data = "["

(1..1000).each do |i|
  data << %{
    {
      "value":        #{i},
      "name":         "Person #{i}",
      "img":          "http://1.gravatar.com/avatar/f80b5bd87ed2e62e1c3fd52e90ee7563?s=40&d=http%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D40&r=X",
      "groups":       [#{(0..rand(5)).inject([]){|a,v| a << rand(5); a.uniq.sort}.collect{|x| "\"#{x}\""}.join(',')}],
      "memberlists":  [#{(0..rand(5)).inject([]){|a,v| a << rand(5); a.uniq.sort}.collect{|x| "\"#{x}\""}.join(',')}]
    }
  }
  data << ",\n" if i != 1000
end

data << "]"

File.open( 'list4.js', 'w' ) do |out|
  out.write(data)
end

puts data